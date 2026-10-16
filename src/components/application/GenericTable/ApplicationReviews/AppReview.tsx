import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import OutlinedDiv from '../../../general/OutlinedDiv/OutlinedDiv';
import { getDayTimeFromTimestamp } from '../../../../helpers';
import { makeStyles } from '../../../../styles/jss';
import { createStyles } from '../../../../styles/jss';
import { grey } from '@mui/material/colors';
import { useLastRatingDateTime } from '../ApplicationsGrid/useLastRatingDateTime';
import { useT } from '../../../../i18n';

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

export default function AppReview({ created, updated, review, handleRefresh, index }) {
  const [expand, setExpand] = React.useState(index === 0);

  const handleExpand = React.useCallback(
    e => {
      setExpand(prev => !prev);
      handleRefresh();
    },
    [setExpand, handleRefresh]
  );

  const classes = useStyles();
  const t = useT();
  const lastUpdated = useLastRatingDateTime({ created, updated });
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
                      <Grid container justifyContent='space-between'>
                        <Typography noWrap color='textSecondary' variant='body1'>
                          {t('Last Updated: {{date}}', { date: lastUpdated })}
                        </Typography>
                        <Typography noWrap color='textSecondary' variant='body1'>
                          {expand ? t('Click to collapse') : t('Click to expand')}
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
