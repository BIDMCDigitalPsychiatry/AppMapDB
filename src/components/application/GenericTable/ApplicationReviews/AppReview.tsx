import React from 'react';
import { Grid, Box, Typography } from '@material-ui/core';
import OutlinedDiv from '../../../general/OutlinedDiv/OutlinedDiv';
import { getDayTimeFromTimestamp } from '../../../../helpers';
import { makeStyles, createStyles } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    container: {
      cursor: 'pointer',
      '&:hover': {
        background: grey[100]
      }
    }
  })
);

const appColumnWidth = 520;

export default function AppReview({ updated, review, handleRefresh }) {
  const [expand, setExpand] = React.useState(false);
  const handleExpand = React.useCallback(
    e => {
      setExpand(prev => !prev);
      handleRefresh();
    },
    [setExpand, handleRefresh]
  );

  const classes = useStyles();
  return (
    <div className={classes.container} onClick={handleExpand}>
      <OutlinedDiv>
        <Box pt={1} pb={1}>
          <Grid container>
            <Grid item style={{ width: appColumnWidth }}>
              <Grid container>
                <Grid item zeroMinWidth xs>
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography noWrap={!expand}>{review}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container justify='space-between'>
                        <Typography noWrap color='textSecondary' variant='caption'>
                          Last Updated: {updated ? getDayTimeFromTimestamp(updated) : ''}
                        </Typography>
                        <Typography noWrap color='textSecondary' variant='caption'>
                          Click to {expand ? 'collapse' : 'expand'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </OutlinedDiv>
    </div>
  );
}
