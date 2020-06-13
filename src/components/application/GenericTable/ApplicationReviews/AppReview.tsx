import React from 'react';
import { Grid, Box, Typography } from '@material-ui/core';
import Application from '../../../../database/models/Application';
import OutlinedDiv from '../../../general/OutlinedDiv/OutlinedDiv';
import { getDayTimeFromTimestamp } from '../../../../helpers';

const appColumnWidth = 520;

export default function AppReview({ updated, review }: Application) {
  return (
    <OutlinedDiv>
      <Box pt={1} pb={1}>
        <Grid container spacing={2}>
          <Grid item style={{ width: appColumnWidth }}>
            <Grid container spacing={2}>
              <Grid item zeroMinWidth xs>
                <Grid container>
                  <Grid item xs={12}>
                    <Typography noWrap variant='h6'>
                      {review}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography noWrap color='textSecondary' variant='caption'>
                      Last Updated: {updated ? getDayTimeFromTimestamp(updated) : ''}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </OutlinedDiv>
  );
}
