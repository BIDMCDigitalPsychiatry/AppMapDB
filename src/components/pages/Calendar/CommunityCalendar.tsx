import * as React from 'react';
import { tables } from '../../../database/dbConfig';
import useTableRow from '../../../database/useTableRow';
import { useIsAdmin } from '../../../hooks';
import CalendarView from '../../application/Calendar';
import useEvents from './useEvents';

export default function CommunityCalendar() {
  const { data: events, handleRefresh } = useEvents();
  const { readSetRow } = useTableRow({ Model: tables.events });
  const isAdmin = useIsAdmin();
  return <CalendarView create={isAdmin} edit={isAdmin} events={events.filter(e => !e.deleted)} readSetRow={readSetRow} handleRefresh={handleRefresh} />;
}
