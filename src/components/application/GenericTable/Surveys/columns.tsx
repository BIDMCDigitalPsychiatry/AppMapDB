import React from 'react';
import * as Icons from '@material-ui/icons';
import { Grid, Typography } from '@material-ui/core';
import { getDayTimeFromTimestamp, publicUrl } from '../../../../helpers';
import AppSummary from '../Applications/AppSummary';
import DialogButton from '../../GenericDialog/DialogButton';
import { useHandleChangeRoute } from '../../../layout/hooks';

export const name = 'Applications';
const center = text => <div style={{ textAlign: 'center' }}>{text}</div>;

export const CenterRadio = ({ checked = false }) => {
  const Icon = checked ? Icons.RadioButtonChecked : Icons.RadioButtonUnchecked;
  return center(<Icon color='action' fontSize='small' />);
};

const LastUpdated = ({ updated }) => (
  <Typography variant='body2' color='textSecondary'>
    {updated ? getDayTimeFromTimestamp(updated) : ''}
  </Typography>
);

const RatedBy = (props = {}) => (
  <Typography variant='body2' color='textSecondary'>
    {props['What is your email address?']}
  </Typography>
);

const Actions = ({ _id = undefined, app = {} } = {}) => {
  const handleChangeRoute = useHandleChangeRoute();
  return (
    <Grid container spacing={1}>
      <Grid item>
        <DialogButton
          variant='link'
          underline='always'
          onClick={handleChangeRoute(publicUrl('/Survey'), {
            _id,
            app,
            mode: 'view'
          })}
        >
          View
        </DialogButton>
      </Grid>
      <Grid item>
        <DialogButton variant='link' underline='always' onClick={() => alert('To be implemented')}>
          Send Follow Up Reminder
        </DialogButton>
      </Grid>
    </Grid>
  );
};

const AppSummaryMapped = ({ app, ...other }) => <AppSummary {...app} {...other} />;

export const useColumns = () => {
  const columns = [
    { name: 'app', header: 'Application', minWidth: 300, Cell: AppSummaryMapped, hoverable: false, sort: 'textLower' },
    { name: 'actions', header: 'Actions', width: 240, Cell: Actions },
    { name: 'What is your email address?', header: 'Submitted By', width: 240, Cell: RatedBy, hoverable: false, sort: 'textLower' },
    {
      name: 'updated',
      header: 'Last Updated',
      width: 225,
      Cell: LastUpdated,
      hoverable: false,
      sort: 'decimal'
    }
  ];

  return columns;
};
