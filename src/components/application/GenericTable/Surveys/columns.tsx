import React from 'react';
import * as Icons from '@material-ui/icons';
import { Grid, Typography } from '@material-ui/core';
import { getDayTimeFromTimestamp, publicUrl, uuid } from '../../../../helpers';
import AppSummary from '../Applications/AppSummary';
import DialogButton from '../../GenericDialog/DialogButton';
import { useHandleChangeRoute } from '../../../layout/hooks';
import { getAppName } from '../Applications/selectors';
import { sendSurveyFollowUpEmail } from '../../../pages/Survey/sendSurveyEmail';
import { tables } from '../../../../database/dbConfig';
import useProcessData from '../../../../database/useProcessData';

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

const LastReminderSent = ({ lastReminderSent }) => (
  <Typography variant='body2' color='textSecondary'>
    {lastReminderSent ? getDayTimeFromTimestamp(lastReminderSent) : ''}
  </Typography>
);

const RatedBy = (props = {}) => (
  <Typography variant='body2' color='textSecondary'>
    {props['What is the best email address we can reach you at?']}
  </Typography>
);

const Actions = ({ _id = undefined, parentId = undefined, surveyType = undefined, followUpCompleted = undefined, app = {} as any, ...other } = {}) => {
  const handleChangeRoute = useHandleChangeRoute();

  const email = other['What is the best email address we can reach you at?'];
  const appName = getAppName(app);

  const processData = useProcessData();

  const followUpSurveyType = surveyType === 'Initial' ? '2 Week' : surveyType === '2 Week' ? '6 Week' : 'Unknown';

  const handleFollowUp = () => {
    const reminderId = uuid();
    sendSurveyFollowUpEmail({ email, appName, surveyId: _id, appId: app._id, followUpSurveyType });
    processData({ Model: tables.surveyReminders, Data: { _id: reminderId, surveyId: _id, email, appId: app._id, appName, time: new Date().getTime() } });
    alert('Follow up email sent');
  };

  return (
    <Grid container spacing={1}>
      <Grid item>
        <DialogButton
          variant='link'
          underline='always'
          onClick={handleChangeRoute(publicUrl('/Survey'), {
            _id,
            app,
            // For view, manually set the follow up survey type since we are viewing the existing record
            surveyType,
            mode: 'view'
          })}
        >
          View
        </DialogButton>
      </Grid>
      {surveyType !== '6 Week' && (
        <Grid item>
          <DialogButton variant='link' underline='always' onClick={handleFollowUp} disabled={followUpCompleted === 'True'}>
            {followUpCompleted === 'True' ? `${followUpSurveyType} Follow Up Completed` : `Send ${followUpSurveyType} Reminder`}
          </DialogButton>
        </Grid>
      )}
    </Grid>
  );
};

const AppSummaryMapped = ({ app, ...other }) => <AppSummary {...app} {...other} />;

export const useColumns = () => {
  const columns = [
    { name: 'app', header: 'Application', minWidth: 300, Cell: AppSummaryMapped, hoverable: false, sort: 'textLower' },
    { name: 'surveyType', header: 'Survey Type', width: 140, sort: 'text' },
    { name: 'actions', header: 'Actions', width: 240, Cell: Actions },
    {
      name: 'lastReminderSent',
      header: 'Last Reminder Sent',
      width: 225,
      Cell: LastReminderSent,
      hoverable: false,
      sort: 'decimal'
    },
    { name: 'email', header: 'Submitted By', width: 240, Cell: RatedBy, hoverable: false, sort: 'textLower' },
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
