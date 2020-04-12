import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { EditDialogButton } from '../../GenericDialog/DialogButton';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../store';
import { tables } from '../../../../database/dbConfig';
import { useSignedIn, useFullScreen, useIsAdmin } from '../../../../hooks';
import { useViewMode, useAdminMode } from '../../../layout/store';
import { useProcessData } from '../../../../database/useProcessData';
import Check from '../../DialogField/Check';

export default function RatingsColumnHistory({ _id }) {
  const application = useSelector((s: AppState) => s.database.applications[_id]);
  const { approved } = application;
  const [viewMode] = useViewMode();
  const signedIn = useSignedIn();
  const fullScreen = useFullScreen();
  const isAdmin = useIsAdmin();
  const [adminMode] = useAdminMode();

  const processData = useProcessData();

  const email = useSelector((s: any) => s.firebase.auth.email);

  const appStr = JSON.stringify(application);

  const handleApprove = React.useCallback(
    approved => () => {
      const app = JSON.parse(appStr);
      app.updated = new Date().getTime();
      app.approverEmail = email;
      app.approved = approved;
      processData({
        Model: tables.applications,
        Action: 'u',
        Data: { ...app },
        Snackbar: true
      });
    },
    [processData, email, appStr]
  );

  return (
    <Grid container alignItems='center' spacing={1}>
      <Grid container alignItems='center' style={{ minHeight: 64 }} item xs={fullScreen && viewMode === 'list' ? 12 : 5}>
        {signedIn && (
          <EditDialogButton
            Module={RateNewAppDialog}
            mount={false}
            variant='primarycontained'
            tooltip=''
            Icon={null}
            initialValues={{ [tables.applications]: application }}
          >
            <Typography noWrap>View / Edit</Typography>
          </EditDialogButton>
        )}
      </Grid>
      {isAdmin && adminMode === true && (
        <Grid container alignItems='center' style={{ minHeight: 64 }} item xs={fullScreen && viewMode === 'list' ? 12 : 7}>
          <Check value={approved} label={approved ? 'Approved' : 'Not approved'} onClick={handleApprove(!approved)} />
        </Grid>
      )}
    </Grid>
  );
}
