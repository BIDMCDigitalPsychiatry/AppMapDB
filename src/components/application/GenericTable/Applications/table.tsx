import React from 'react';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import * as selectors from './selectors';
import { Grid, Typography } from '@material-ui/core';
import logo from '../../../../images/logo.png';
import * as Icons from '@material-ui/icons';
import { useWidth } from '../../../layout/LayoutStore';
import DialogButton from '../../GenericDialog/DialogButton';
import { ViewModeButton } from '../ApplicationsList/table';
import * as FilterDialog from '../../GenericDialog/Filter';
import * as GettingStartedDialog from '../../GenericDialog/GettingStarted';

const center = text => <div style={{ textAlign: 'center' }}>{text}</div>;

export const CenterRadio = () => center(<Icons.RadioButtonChecked color='action' fontSize='small' />);

const Radios = () => {
  return (
    <Grid container>
      <Grid item xs>
        <CenterRadio />
      </Grid>
      <Grid item xs>
        <CenterRadio />
      </Grid>

      <Grid item xs>
        <CenterRadio />
      </Grid>

      <Grid item xs>
        <CenterRadio />
      </Grid>
    </Grid>
  );
};

const Radios2 = () => {
  return (
    <Grid container>
      <Grid item xs>
        <CenterRadio />
      </Grid>
      <Grid item xs>
        <CenterRadio />
      </Grid>

      <Grid item xs>
        <CenterRadio />
      </Grid>
    </Grid>
  );
};

const Radios3 = () => {
  return (
    <Grid container>
      <Grid item xs>
        <CenterRadio />
      </Grid>
      <Grid item xs>
        <CenterRadio />
      </Grid>
      <Grid item xs>
        <CenterRadio />
      </Grid>
      <Grid item xs>
        <CenterRadio />
      </Grid>
      <Grid item xs>
        <CenterRadio />
      </Grid>
    </Grid>
  );
};

const AppColumn = ({ name, company }) => {
  return (
    <Grid container alignItems='center'>
      <Grid item>
        <Grid container alignItems='center'>
          <Grid item>
            <img style={{ height: 40 }} src={logo} alt='logo' />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs>
        <Grid container style={{ padding: 4 }}>
          <Grid item xs={12}>
            <Typography noWrap variant='caption' color='textPrimary'>
              {name}
            </Typography>
          </Grid>
          <Grid item xs={12} style={{ paddingLeft: 4 }}>
            <Typography noWrap variant='caption' color='textSecondary'>
              by {company}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

const name = 'Applications';
const defaultProps: GenericTableContainerProps = {
  name,
  columns: [
    { name: 'app', header: 'Application', minWidth: 180, Cell: AppColumn },
    {
      name: 'functionality',
      minWidth: 270,
      header: (
        <>
          <Grid container>
            <Grid item xs={12}>
              <Grid container justify='center'>
                Functionality
              </Grid>
            </Grid>
            {['iOS', 'Android', 'Offline', 'Accessibility'].map(t => (
              <Grid item xs key={t}>
                {center(t)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: Radios
    },
    {
      name: 'cost',
      minWidth: 300,
      header: (
        <>
          <Grid container>
            <Grid item xs={12}>
              <Grid container justify='center'>
                Cost
              </Grid>
            </Grid>
            {['Totally Free', 'In-App Purchases', 'Subscription'].map(t => (
              <Grid item xs key={t}>
                {center(t)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: Radios2
    },
    {
      name: 'features',
      minWidth: 380,
      header: (
        <>
          <Grid container>
            <Grid item xs={12}>
              <Grid container justify='center'>
                Features
              </Grid>
            </Grid>
            {['Track Mood', 'Track Meds', 'Jourals', 'Peer Support', 'CBT'].map(t => (
              <Grid item xs key={t}>
                {center(t)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: Radios3
    }
    /*{ name: 'ios', header: 'iOS' },
    { name: 'android', header: 'Android' },
    { name: 'offline', header: 'Offline Mode' },
    { name: 'accessibility', header: 'Accessibility' },
    { name: 'free', header: 'Free' },
    { name: 'purchases', header: 'In App Purchases' },
    { name: 'subscription', header: 'Subscription' },
    { name: 'trackModd', header: 'Mood' },
    { name: 'trackMedication', header: 'Medication' },
    { name: 'journaling', header: 'Journaling' },
    { name: 'peerSupport', header: 'Peer Support' },
    { name: 'cbt', header: 'CBT' },
    */
  ],
  toolbar: true,
  selector: selectors.from_database,
  footer: true,
  search: true,
  buttons: [
    <DialogButton Module={FilterDialog} Icon={Icons.FilterList} tooltip='Filter' />,
    <ViewModeButton mode='table' />,
    <DialogButton Module={GettingStartedDialog} Icon={Icons.Help} tooltip='Help Getting Started' />
  ]
};

export const Applications = props => {
  const width = useWidth();
  return <GenericTableContainer {...defaultProps} showScroll={width < 1200 ? true : false} {...props} />;
};
