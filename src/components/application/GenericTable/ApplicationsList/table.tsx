import React from 'react';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import * as selectors from './selectors';
import { Grid, Typography } from '@material-ui/core';
import logo from '../../../../images/logo.png';
import * as Icons from '@material-ui/icons';
import { useWidth, useViewMode } from '../../../layout/LayoutStore';
import DialogButton from '../../GenericDialog/DialogButton';
import * as FilterDialog from '../../GenericDialog/Filter';
import * as GettingStartedDialog from '../../GenericDialog/GettingStarted';

function StyledRadio(props) {
  return <Icons.RadioButtonChecked color='action' fontSize='small' style={{ height: 14 }} />;
}

const AppSummary = ({ name, company }) => {
  return (
    <Grid container justify='center' alignItems='center' spacing={4}>
      <Grid item style={{ width: 200 }}>
        <Grid container justify='center' alignItems='center'>
          <Grid item xs={12}>
            <Typography noWrap variant='h6' align='center' color='textPrimary'>
              {name}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container justify='center' alignItems='center'>
              <Grid item>
                <img style={{ height: 132 }} src={logo} alt='logo' />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs>
        <Grid container spacing={6}>
          {[
            { title: 'Platforms', labels: ['Android', 'iOS', 'Web Browser'] },
            { title: 'Cost', labels: ['Free', 'Free w/in-app purchase', 'Subscription'] },
            { title: 'Privacy', labels: ['Privacy Policy', 'Can Delete Data', 'Data Stored on Device'] },
            { title: 'Clinical Foundation', labels: ['Efficacy Studies', 'Feasability Studies'] },
            {
              title: 'Features',
              labels: ['Symptom Tracking', 'Chatbot/AI', 'Journaling', 'CBT', 'Mindfulness', 'Productivity']
            }
          ].map(g => (
            <Grid item key={g.title}>
              <Typography variant='body1'>{g.title}</Typography>
              {g.labels.map(label => (
                <Grid container key={label} spacing={1} style={{ marginLeft: 1 }}>
                  <Grid item>
                    <StyledRadio />
                  </Grid>
                  <Grid item>
                    <Typography variant='body2'>{label}</Typography>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export const ViewModeButton = ({ mode = 'list' }) => {
  const [, setViewMode] = useViewMode() as any;
  const handleClick = React.useCallback(() => setViewMode(mode === 'list' ? 'table' : 'list'), [mode, setViewMode]);
  return (
    <DialogButton
      Icon={mode === 'list' ? Icons.List : Icons.ViewList}
      tooltip={`Switch to ${mode === 'list' ? 'Table' : 'List'} View`}
      onClick={handleClick}
    />
  );
};

const name = 'Applications';
const defaultProps: GenericTableContainerProps = {
  name,
  columns: [{ name: 'app', header: 'Application', minWidth: 1300, Cell: AppSummary }],
  toolbar: true,
  selector: selectors.from_database,
  footer: true,
  search: true,
  includeHeaders: false,
  fixedRowCount: 0,
  rowHeight: 200,
  buttons: [
    <DialogButton Module={FilterDialog} Icon={Icons.FilterList} tooltip='Filter' />,
    <ViewModeButton />,
    <DialogButton Module={GettingStartedDialog} Icon={Icons.Help} tooltip='Help Getting Started' />
  ]
};

export const ApplicationsList = props => {
  const width = useWidth();
  return <GenericTableContainer {...defaultProps} showScroll={width < 1375 ? true : false} {...props} />;
};
