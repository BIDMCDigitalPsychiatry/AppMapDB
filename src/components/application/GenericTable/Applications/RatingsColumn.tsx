import React from 'react';
import { Grid } from '@material-ui/core';
import { EditDialogButton } from '../../GenericDialog/DialogButton';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../store';
import { tables } from '../../../../database/dbConfig';
import { useSignedIn } from '../../../../hooks';

export default function RatingsColumn({ _id, rating, ratingIds = [] }) {
  const initialValues = useSelector((s: AppState) => s.database.applications[_id]);
  const signedIn = useSignedIn();
  return (
    <Grid container alignItems='center'>
      <Grid item xs={12}>
        <Grid container justify='space-between'>
          <Grid item>
            {signedIn && (
              <EditDialogButton
                Module={RateNewAppDialog}
                mount={false}
                variant='primarycontained'
                tooltip=''
                Icon={null}
                initialValues={{ [tables.applications]: initialValues }}
              >
                View / Edit App
              </EditDialogButton>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
