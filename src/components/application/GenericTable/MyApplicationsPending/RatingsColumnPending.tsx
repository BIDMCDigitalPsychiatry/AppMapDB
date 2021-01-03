import React from 'react';
import { Box, Grid } from '@material-ui/core';
import { EditDialogButton } from '../../GenericDialog/DialogButton';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import * as ApplicationHistoryDialogV2 from '../../GenericDialog/ApplicationHistoryDialogV2';
import * as ApplicationDialog from '../../GenericDialog/ApplicationDialog';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../store';
import { tables } from '../../../../database/dbConfig';
import { useSignedIn } from '../../../../hooks';
import * as Icons from '@material-ui/icons';

export default function RatingsColumnPending({ _id, canEdit = true, showRatings = true, showInfo = true }) {
  const initialValues = useSelector((s: AppState) => s.database.applications[_id]);
  const signedIn = useSignedIn();

  return (
    <Grid container alignItems='center' spacing={1}>
      {showInfo && (
        <Grid item>
          <EditDialogButton
            Module={ApplicationDialog}
            variant='iconbutton'
            mount={false}
            Icon={Icons.Pageview}
            initialValues={{ [tables.applications]: initialValues }}
            tooltip='View Additional Application Info'
            placement='bottom'
          />
        </Grid>
      )}
      {signedIn && (
        <Grid item>
          {canEdit ? (
            <EditDialogButton
              variant='iconbutton'
              Module={RateNewAppDialog}
              mount={false}
              Icon={Icons.Edit}
              initialValues={{ [tables.applications]: initialValues }}
              tooltip='Edit'
              placement='bottom'              
            />
          ) : (
            <Box ml={5} />
          )}
        </Grid>
      )}
      {showRatings && (
        <Grid item>
          <EditDialogButton
            variant='iconbutton'
            Module={ApplicationHistoryDialogV2}
            mount={false}
            Icon={Icons.Timeline}
            initialValues={{ [tables.applications]: initialValues }}
            tooltip='Open Ratings History'
            placement='bottom'
          />
        </Grid>
      )}
    </Grid>
  );
}
