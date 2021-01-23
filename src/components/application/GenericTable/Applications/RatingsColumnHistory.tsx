import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { EditDialogButton } from '../../GenericDialog/DialogButton';
import { Status } from '../../GenericTable/MyApplicationsPending/columns';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../store';
import { tables } from '../../../../database/dbConfig';
import { useSignedIn, useFullScreen, useIsAdmin } from '../../../../hooks';
import { useViewMode, useAdminMode } from '../../../layout/store';
import { useProcessData } from '../../../../database/useProcessData';
import Check from '../../DialogField/Check';

export default function RatingsColumnHistory({ _id, isAdmin: IsAdmin = undefined }) {
  const application = useSelector((s: AppState) => s.database.applications[_id]);
  const { approved, draft } = application;
  const deleted = application?.delete;
  const [viewMode] = useViewMode();
  const signedIn = useSignedIn();
  const fullScreen = useFullScreen();
  const isAdmin = useIsAdmin();
  const [adminMode] = useAdminMode();

  const processData = useProcessData();

  const email = useSelector((s: any) => s.layout.user?.signInUserSession?.idToken?.payload?.email);

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

  const handleDelete = React.useCallback(
    deleted => () => {
      const app = JSON.parse(appStr);
      app.updated = new Date().getTime();
      app.delete = deleted;
      processData({
        Model: tables.applications,
        Action: 'u',
        Data: { ...app },
        Snackbar: true
      });
    },
    [processData, appStr]
  );

  return (
    <>
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
        {(IsAdmin || (isAdmin && adminMode === true)) && (
          <Grid container alignItems='center' style={{ minHeight: 92 }} item xs={fullScreen && viewMode === 'list' ? 12 : 7}>
            <div style={{ marginBottom: -12 }}>
              {draft ? (
                <Status draft={draft} approved={approved} />
              ) : (
                <Check value={approved} label={approved ? 'Approved' : 'Not approved'} onClick={handleApprove(!approved)} />
              )}
            </div>
            <div style={{ marginTop: -12 }}>
              <Check
                value={deleted}
                label={deleted ? 'Archived' : 'Not archived'}
                onClick={handleDelete(!deleted)}
                style={{ color: deleted ? 'red' : undefined }}
              />
            </div>
          </Grid>
        )}
      </Grid>
      {IsAdmin && <Typography variant='caption'>Rated by: {application?.email}</Typography>}
    </>
  );
}
