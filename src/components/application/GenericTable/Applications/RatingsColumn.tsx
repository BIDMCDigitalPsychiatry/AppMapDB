import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import DialogButton from '../../GenericDialog/DialogButton';
import * as RateAppDialog from '../../GenericDialog/RateApp';
import * as AppReviewsDialog from '../../GenericDialog/AppReviews';
import RatingReadOnly from './RatingReadOnly';

export default function RatingsColumn({ _id, rating, ratingIds = [] }) {
  return (
    <Grid container alignItems='center'>
      <Grid item xs={12}>
        <Grid container alignItems='center' justify='space-between'>
          <RatingReadOnly size='small' precision={0.25} value={Number(rating)} />
          <Typography variant='caption' color='textSecondary'>
            {`(${rating})`}
          </Typography>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container justify='space-between'>
          <Grid item>
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
              {ratingIds.length} Reviews
            </DialogButton>
          </Grid>
          <Grid item>{'  |  '}</Grid>
          <Grid item>
            <DialogButton
              Module={RateAppDialog}
              mount={false}
              variant='link'
              size='small'
              Icon={null}
              tooltip='Click to Submit Rating'
              initialValues={{ appId: _id }}
            >
              Rate App
            </DialogButton>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
