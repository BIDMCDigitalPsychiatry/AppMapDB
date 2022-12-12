import React from 'react';
import { Grid } from '@mui/material';
import { EditDialogButton } from '../../GenericDialog/DialogButton';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import * as ApplicationHistoryDialogV2 from '../../GenericDialog/ApplicationHistoryDialogV2';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../store';
import { tables } from '../../../../database/dbConfig';
import { useSignedIn } from '../../../../hooks';
import * as Icons from '@mui/icons-material';
import { useHandleChangeRoute } from '../../../layout/hooks';
import { publicUrl } from '../../../../helpers';

export default function RatingsColumnPending({ _id }) {
  const initialValues = useSelector((s: AppState) => s.database[tables.applications][_id]);
  const signedIn = useSignedIn();
  const handleChangeRoute = useHandleChangeRoute();

  return (
    <Grid container alignItems='center' spacing={1}>
      <Grid item>
        <EditDialogButton
          variant='iconbutton'
          mount={false}
          Icon={Icons.Pageview}
          onClick={handleChangeRoute(publicUrl('/ViewApp'), { app: initialValues, from: 'Admin' })}
          tooltip='View Additional Application Info2'
          placement='bottom'
        />
      </Grid>
      {signedIn && (
        <Grid item>
          <EditDialogButton
            variant='iconbutton'
            Module={RateNewAppDialog}
            mount={false}
            Icon={Icons.Edit}
            initialValues={{ [tables.applications]: initialValues }}
            tooltip='Edit'
            placement='bottom'
          />
        </Grid>
      )}
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
    </Grid>
  );
}
