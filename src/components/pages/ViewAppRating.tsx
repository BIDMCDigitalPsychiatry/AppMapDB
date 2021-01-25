import * as React from 'react';
import { Grid, Typography, createStyles, makeStyles, Box, Paper } from '@material-ui/core';
import { getDayTimeFromTimestamp } from '../../helpers';
import ExpandableCategories from '../application/GenericTable/ApplicationsList/ExpandableCategories';
import ArrowButton from '../general/ArrowButton';

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

  return (
    <Paper style={{ padding: 24, paddingTop: 8 }}>
      <Grid container justify='space-between' alignItems='center' spacing={0}>
        <Grid item xs>
          <Grid container spacing={1}>
            <Grid item>
              <Typography color='textSecondary' variant='caption'>
                Last Updated:
              </Typography>
            </Grid>
            <Grid item>
              <Typography noWrap className={classes.primaryLightText} variant='caption'>
                {updated ? getDayTimeFromTimestamp(updated) : created ? getDayTimeFromTimestamp(created) : ''}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <div style={{ textAlign: 'right' }}>
            <Grid container spacing={1}>
              <Grid item>
                <Typography color='textSecondary' variant='caption'>
                  By:
                </Typography>
              </Grid>
              <Grid item>
                <Typography noWrap className={classes.primaryLightText} variant='caption'>
                  {email}
                </Typography>
              </Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
      <Grid container justify='space-between' alignItems='center' spacing={0}>
        <Grid item xs>
          <Box mt={-0.75}>
            <Typography variant='body1' className={classes.bold}>
              Qualitative Ratings
            </Typography>
          </Box>
        </Grid>
        <Grid item>
          <ArrowButton size='small' variant='body2' label='Read Review' onClick={() => alert('To be completed')} />
        </Grid>
      </Grid>
      <ExpandableCategories {...props} isExpandable={false} titleVariant='body2' />
    </Paper>
  );
}
