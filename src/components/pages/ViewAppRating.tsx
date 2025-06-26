import * as React from 'react';
import { Grid, Typography, Box, Paper } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { getDayTimeFromTimestamp, isEmpty } from '../../helpers';
import ExpandableCategories from '../application/GenericTable/ApplicationsList/ExpandableCategories';
import { useLastRatingDateTime } from '../application/GenericTable/ApplicationsGrid/useLastRatingDateTime';

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    primaryLightText: {
      fontWeight: 700,
      color: palette.primary.light
    },
    bold: {
      fontWeight: 900,
      color: palette.common.black
    }
  })
);

export default function ViewAppRating(props) {
  const classes = useStyles();
  const { updated, created, email } = props;

  const lastUpdated = useLastRatingDateTime({ created, updated });

  return (
    <Paper style={{ padding: 24, paddingTop: 8 }}>
      <Grid container justifyContent='space-between' alignItems='center' spacing={0}>
        <Grid item xs>
          <Grid container spacing={1}>
            <Grid item>
              <Typography color='textSecondary' variant='body1'>
                Last Updated:
              </Typography>
            </Grid>
            <Grid item>
              <Typography noWrap className={classes.primaryLightText} variant='body1'>
                {lastUpdated}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <div style={{ textAlign: 'right' }}>
            <Grid container spacing={1}>
              <Grid item>
                <Typography color='textSecondary' variant='body1'>
                  By:
                </Typography>
              </Grid>
              <Grid item>
                <Typography noWrap className={classes.primaryLightText} variant='body1'>
                  {/*email*/}
                  App Rater
                </Typography>
              </Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
      <Grid container style={{ marginTop: 4 }} justifyContent='space-between' alignItems='center' spacing={2}>
        <Grid item xs={12}>
          <Typography variant='body1' className={classes.bold}>
            Qualitative Review
          </Typography>
          <Typography variant='body1'>{`This review represents the view of the app rater and is not an endorsement by MIND.`}</Typography>
          <Box mt={1}>
            <Typography variant='body1'>{isEmpty(props.review) ? 'Not available' : props.review}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='body1' className={classes.bold}>
            Qualitative Ratings
          </Typography>
        </Grid>
        {/*<Grid item>
          <ArrowButton size='small' variant='body2' label='Read Review' onClick={() => alert('To be completed')} />
        </Grid>
        */}
      </Grid>
      <ExpandableCategories {...props} isExpandable={false} titleVariant='body1' />
    </Paper>
  );
}
