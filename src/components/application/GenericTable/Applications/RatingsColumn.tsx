import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { EditDialogButton } from '../../GenericDialog/DialogButton';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import * as ApplicationHistoryDialog from '../../GenericDialog/ApplicationHistoryDialog';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../store';
import { tables } from '../../../../database/dbConfig';
import { useSignedIn, useFullScreen } from '../../../../hooks';
import { useViewMode } from '../../../layout/store';

export default function RatingsColumn({ _id }) {
  const initialValues = useSelector((s: AppState) => s.database.applications[_id]);
  const [viewMode] = useViewMode();
  const signedIn = useSignedIn();
  const fullScreen = useFullScreen();

  return (
    <Grid container alignItems='center' spacing={1}>
      {signedIn && (
        <Grid container alignItems='center' style={{ minHeight: 64 }} item xs={fullScreen && viewMode === 'list' ? 12 : 5}>
          <EditDialogButton
            Module={RateNewAppDialog}
            mount={false}
            variant='primarycontained'
            tooltip=''
            Icon={null}
            initialValues={{ [tables.applications]: initialValues }}
          >
            <Typography noWrap>View / Edit</Typography>
          </EditDialogButton>
        </Grid>
      )}
      <Grid container alignItems='center' style={{ minHeight: 64 }} item xs={fullScreen && viewMode === 'list' ? 12 : 7}>
        <EditDialogButton
          Module={ApplicationHistoryDialog}
          mount={false}
          variant='primarycontained'
          tooltip=''
          Icon={null}
          initialValues={{ [tables.applications]: initialValues }}
        >
          <Typography noWrap>Rating History</Typography>
        </EditDialogButton>
      </Grid>
    </Grid>
  );
}
