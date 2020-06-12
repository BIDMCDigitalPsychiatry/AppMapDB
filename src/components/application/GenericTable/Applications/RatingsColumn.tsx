import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { EditDialogButton } from '../../GenericDialog/DialogButton';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import * as ApplicationHistoryDialog from '../../GenericDialog/ApplicationHistoryDialog';
import * as ReportIssueDialog from '../../GenericDialog/ReportIssue';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../store';
import { tables } from '../../../../database/dbConfig';
import { useSignedIn } from '../../../../hooks';
import * as Icons from '@material-ui/icons';

export default function RatingsColumn({ _id }) {
  const initialValues = useSelector((s: AppState) => s.database.applications[_id]);
  const signedIn = useSignedIn();

  return (
    <Grid container alignItems='center' spacing={1}>
      {/* TODO Add more info dialog
      <Grid item>
        <DialogButton variant='iconbutton' Icon={Icons.Pageview} color='primary' tooltip='Open/View More Info' />;
      </Grid>
      */}
      {signedIn && (
        <Grid item>
          <EditDialogButton
            variant='iconbutton'
            Module={RateNewAppDialog}
            mount={false}
            Icon={Icons.Edit}
            initialValues={{ [tables.applications]: initialValues }}
            color='primary'
            tooltip='Edit'
            placement='bottom'
          />
        </Grid>
      )}
      <Grid item>
        <EditDialogButton
          variant='iconbutton'
          Module={ApplicationHistoryDialog}
          mount={false}
          Icon={Icons.Timeline}
          initialValues={{ [tables.applications]: initialValues }}
          color='primary'
          tooltip='Open Ratings History'
          placement='bottom'
        />
      </Grid>
      <Grid item>
        <Typography color='error'>
          <EditDialogButton
            variant='iconbutton'
            color='inherit'
            Module={ReportIssueDialog}
            mount={false}
            Icon={Icons.Report}
            initialValues={{ [tables.applications]: initialValues }}
            tooltip='Report Issue'
            placement='bottom'
          />
        </Typography>
      </Grid>
    </Grid>
  );
}
