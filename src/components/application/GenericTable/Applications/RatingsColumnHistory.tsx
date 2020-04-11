import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { EditDialogButton } from '../../GenericDialog/DialogButton';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import * as ApplicationHistoryDialog from '../../GenericDialog/ApplicationHistoryDialog';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../store';
import { tables } from '../../../../database/dbConfig';
import { useSignedIn, useFullScreen, useIsAdmin } from '../../../../hooks';
import { useViewMode } from '../../../layout/store';

export default function RatingsColumnHistory({ _id }) {
  const initialValues = useSelector((s: AppState) => s.database.applications[_id]);
  const { approved } = initialValues;
  const [viewMode] = useViewMode();
  const signedIn = useSignedIn();
  const fullScreen = useFullScreen();
  const isAdmin = useIsAdmin();
  return (
    <Grid container alignItems='flex-start' spacing={1}>
      <Grid container item xs={fullScreen && viewMode === 'list' ? 12 : 5}>
        {signedIn && (
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
        )}
      </Grid>
      <Grid container item xs={fullScreen && viewMode === 'list' ? 12 : 7}>
        {isAdmin && approved !== true && (
          <EditDialogButton
            Module={ApplicationHistoryDialog}
            mount={false}
            variant='primarycontained'
            tooltip=''
            Icon={null}
            initialValues={{ [tables.applications]: initialValues }}
          >
            <Typography noWrap>Approve</Typography>
          </EditDialogButton>
        )}
      </Grid>
    </Grid>
  );
}
