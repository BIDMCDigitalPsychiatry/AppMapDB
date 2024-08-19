import React from 'react';
import { Box, Grid } from '@mui/material';
import { EditDialogButton } from '../../GenericDialog/DialogButton';
import * as ApplicationHistoryDialogV2WithDrafts from '../../GenericDialog/ApplicationHistoryDialogV2WithDrafts';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../store';
import { tables } from '../../../../database/dbConfig';
import { useSignedInRater } from '../../../../hooks';
import * as Icons from '@mui/icons-material';
import { useHandleChangeRoute } from '../../../layout/hooks';
import { publicUrl } from '../../../../helpers';

export default function MyRatingsColumnPending({ _id, canEdit = true, showRatings = true, showInfo = true }) {
  const initialValues = useSelector((s: AppState) => s.database.applications[_id]);
  const signedInRater = useSignedInRater();

  const handleChangeRoute = useHandleChangeRoute();

  return (
    <Grid container alignItems='center' spacing={1}>
      {showInfo && (
        <Grid item>
          <EditDialogButton
            variant='iconbutton'
            mount={false}
            Icon={Icons.Pageview}
            onClick={handleChangeRoute(publicUrl('/ViewApp'), { app: initialValues, from: 'ApplicationTable' })}
            tooltip='View Additional Application Info'
            placement='bottom'
          />
        </Grid>
      )}
      {signedInRater && (
        <Grid item>
          {canEdit ? (
            <EditDialogButton
              id='Rate an App V2'
              variant='iconbutton'
              mount={false}
              Icon={Icons.Edit}
              onClick={handleChangeRoute(publicUrl('/RateExistingApp'))}
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
            Module={ApplicationHistoryDialogV2WithDrafts}
            mount={false}
            Icon={Icons.Timeline}
            initialValues={{ [tables.applications]: initialValues }}
            tooltip='Open My Ratings History'
            placement='bottom'
          />
        </Grid>
      )}
    </Grid>
  );
}
