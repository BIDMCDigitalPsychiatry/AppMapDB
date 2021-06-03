import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';
import '@fullcalendar/list/main.css';
import React, { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timelinePlugin from '@fullcalendar/timeline';
import { Container, Paper, useTheme, useMediaQuery, makeStyles } from '@material-ui/core';
import Header from './Header';
import Toolbar from './Toolbar';
import * as EditEventDialog from '../GenericDialog/EditEvent';
import { renderDialogModule } from '../GenericDialog/DialogButton';
import { useDialogState } from '../GenericDialog/useDialogState';
import * as EventDialog from '../GenericDialog/Event';
import { uuid } from '../../../helpers';
import { useUserId } from '../../layout/hooks';
import { View } from '../../../database/models/Event';

const useStyles = makeStyles((theme: any) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  },
  calendar: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    '& .fc-unthemed .fc-head': {
      backgroundColor: theme.palette.background.dark
    },
    '& .fc-unthemed .fc-body': {
      backgroundColor: theme.palette.background.default
    },
    '& .fc-unthemed .fc-row': {
      borderColor: theme.palette.divider
    },
    '& .fc-unthemed .fc-axis': {
      ...theme.typography.body2
    },
    '& .fc-unthemed .fc-divider': {
      backgroundColor: theme.palette.background.dark,
      borderColor: theme.palette.divider
    },
    '& .fc-unthemed th': {
      borderColor: theme.palette.divider
    },
    '& .fc-unthemed td': {
      borderColor: theme.palette.divider
    },
    '& .fc-unthemed td.fc-today': {
      backgroundColor: theme.palette.background.dark
    },
    '& .fc-unthemed .fc-highlight': {
      backgroundColor: theme.palette.background.dark
    },
    '& .fc-unthemed .fc-event': {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
      borderWidth: 2,
      opacity: 0.9,
      '& .fc-time': {
        ...theme.typography.h6,
        color: 'inherit'
      },
      '& .fc-title': {
        ...theme.typography.body1,
        color: 'inherit'
      }
    },
    '& .fc-unthemed .fc-day-top': {
      ...theme.typography.body2
    },
    '& .fc-unthemed .fc-day-header': {
      ...theme.typography.subtitle2,
      fontWeight: theme.typography.fontWeightMedium,
      color: theme.palette.text.secondary,
      padding: theme.spacing(1),
      backgroundColor: theme.palette.background.dark
    },
    '& .fc-unthemed .fc-list-view': {
      borderColor: theme.palette.divider
    },
    '& .fc-unthemed .fc-list-empty': {
      ...theme.typography.subtitle1
    },
    '& .fc-unthemed .fc-list-heading td': {
      backgroundColor: theme.palette.background.dark,
      borderColor: theme.palette.divider
    },
    '& .fc-unthemed .fc-list-heading-main': {
      ...theme.typography.h6
    },
    '& .fc-unthemed .fc-list-heading-alt': {
      ...theme.typography.h6
    },
    '& .fc-unthemed .fc-list-item:hover td': {
      backgroundColor: theme.palette.background.dark
    },
    '& .fc-unthemed .fc-list-item-title': {
      ...theme.typography.body1
    },
    '& .fc-unthemed .fc-list-item-time': {
      ...theme.typography.body2
    }
  }
}));

const CalendarView = ({ events, readSetRow, handleRefresh, create = false, edit = false }) => {
  const classes = useStyles();
  const calendarRef = useRef<FullCalendar | null>(null);
  const theme = useTheme();
  const mobileDevice = useMediaQuery(theme.breakpoints.down('sm'));

  const [date, setDate] = useState<Date>(moment().toDate());
  const [view, setView] = useState<View>(mobileDevice ? 'listWeek' : 'dayGridMonth');

  const [, setDialogState] = useDialogState('Add Event');
  const [, setEditDialogState] = useDialogState('Edit Event');

  const handleDateToday = (): void => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.today();
      setDate(calendarApi.getDate());
    }
  };

  const handleViewChange = (newView: View): void => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.changeView(newView);
      setView(newView);
    }
  };

  const handleDatePrev = (): void => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.prev();
      setDate(calendarApi.getDate());
    }
  };

  const handleDateNext = (): void => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.next();
      setDate(calendarApi.getDate());
    }
  };

  const userId = useUserId();

  const handleRangeSelect = (arg: any): void => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.unselect();
    }

    setDialogState({
      open: true,
      initialValues: {
        id: uuid(),
        userId,
        allDay: false,
        color: '',
        description: '',
        end: moment(arg.start).add(1, 'hours').toDate(), //new Date(arg.end),
        start: new Date(arg.start),
        frequency: 'Once',
        frequencyEnd: moment(arg.start).add(1, 'months').toDate(),
        title: '',
        submit: null
      }
    });
  };

  const handleEventSelect = (arg: any): void => {
    setEditDialogState({
      open: true,
      type: 'Edit',
      eventId: arg.event.id
    });
  };

  const handleEventResize = async ({ event }: any): Promise<void> => {
    readSetRow({
      id: event.id,
      values: {
        allDay: event.allDay,
        start: event.start.toISOString(),
        end: event.end.toISOString()
      },
      onSuccess: handleRefresh
    });
  };

  const handleEventDrop = async ({ event }: any): Promise<void> => {
    readSetRow({
      id: event.id,
      values: {
        allDay: event.allDay,
        start: event.start.toISOString(),
        end: event.end.toISOString()
      },
      onSuccess: handleRefresh
    });
  };

  useEffect(() => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      const newView = mobileDevice ? 'listWeek' : 'dayGridMonth';

      calendarApi.changeView(newView);
      setView(newView);
    }
  }, [mobileDevice]);

  return (
    <Container maxWidth={false}>
      {create && renderDialogModule({ ...EventDialog, onClose: handleRefresh })}
      {renderDialogModule({ ...EditEventDialog, disabled: !edit, onClose: handleRefresh })}
      {create && <Header />}
      <Toolbar date={date} onDateNext={handleDateNext} onDatePrev={handleDatePrev} onDateToday={handleDateToday} onViewChange={handleViewChange} view={view} />
      <Paper className={classes.calendar}>
        <FullCalendar
          allDayMaintainDuration
          defaultDate={date}
          defaultView={view}
          droppable
          editable
          eventClick={handleEventSelect}
          eventDrop={handleEventDrop}
          eventLimit
          eventResizableFromStart
          eventResize={handleEventResize}
          events={events.filter(e => !e.deleted)}
          header={false}
          height={800}
          ref={calendarRef}
          rerenderDelay={10}
          select={handleRangeSelect}
          selectable
          weekends
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, timelinePlugin]}
        />
      </Paper>
    </Container>
  );
};

export default CalendarView;
