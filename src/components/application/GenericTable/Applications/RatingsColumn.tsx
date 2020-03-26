import React from 'react';
import { Grid } from '@material-ui/core';
import { EditDialogButton } from '../../GenericDialog/DialogButton';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../store';
import { tables } from '../../../../database/dbConfig';

export default function RatingsColumn({ _id, rating, ratingIds = [] }) {
  const initialValues = useSelector((s: AppState) => s.database.applications[_id]);
  return (
    <Grid container alignItems='center'>
      {/*<Grid item xs={12}>
        <Grid container alignItems='center' justify='space-between'>
          <RatingReadOnly size='small' precision={0.5} value={Number(rating)} readOnly={true} />
          <Typography variant='caption' color='textSecondary'>
            {`(${rating})`}
          </Typography>
        </Grid>
      </Grid>
    */}
      <Grid item xs={12}>
        <Grid container justify='space-between'>
          {/*<Grid item>
            <DialogButton
              Module={AppReviewsDialog}
              mount={false}
              disabled={ratingIds.length === 0}
              variant='link'
              size='small'
              Icon={null}
              tooltip='Click to View'
              initialValues={{ _id }}
            >
              {ratingIds.length} {ratingIds.length === 1 ? 'Review' : 'Reviews'}
            </DialogButton>
          </Grid>
          <Grid item>{'  |  '}</Grid>
          */}
          <Grid item>
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
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
