import React from 'react';
import { Grid } from '@material-ui/core';
import { EditDialogButton } from '../../GenericDialog/DialogButton';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import * as ApplicationHistoryDialog from '../../GenericDialog/ApplicationHistoryDialog';
import * as ApplicationDialog from '../../GenericDialog/ApplicationDialog';
import * as SuggestEditDialog from '../../GenericDialog/SuggestEdit';
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
          Module={ApplicationHistoryDialog}
          mount={false}
          Icon={Icons.Timeline}
          initialValues={{ [tables.applications]: initialValues }}
          tooltip='Open Ratings History'
          placement='bottom'
        />
      </Grid>
      <Grid item>
        <EditDialogButton
          variant='iconbutton'
          Module={SuggestEditDialog}
          mount={false}
          Icon={Icons.Report}
          initialValues={{ [tables.applications]: initialValues }}
          tooltip='Suggest Edit'
          placement='bottom'
        />
      </Grid>
    </Grid>
  );
}
