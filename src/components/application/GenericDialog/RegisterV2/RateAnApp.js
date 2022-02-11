import { Button, Grid, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import { publicUrl } from '../../../../helpers';
import { useChangeRoute } from '../../../layout/hooks';
import * as Icons from '@mui/icons-material';

export const title = 'Sign Up';

const borderRadius = 25;
const useStyles = makeStyles(({ palette }) =>
  createStyles({
    rateAnApp: {
      background: palette.secondary.light,
      color: palette.text.primary,
      padding: 24,
      borderRadius
    },
    arrowRight: {
      color: palette.primary.light
    },
    primaryTextSmall: {
      fontWeight: 900,
      color: palette.primary.dark
    }
  })
);

export default function RateAnApp({ onClick = undefined }) {
  const classes = useStyles();
  const changeRoute = useChangeRoute();

  const handleRateApp = React.useCallback(() => {
    changeRoute(publicUrl('/RateAnApp'));
    onClick && onClick();
  }, [changeRoute, onClick]);

  return (
    <Grid container alignItems='center' spacing={2} className={classes.rateAnApp}>
      <Grid item xs={12}>
        <Typography variant='h5' style={{ fontWeight: 900 }}>
          Interested in rating an app?
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>Our database is sourced by app reviews from trained app raters. Rating an app is an interactive process.</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>
          Raters will be prompted through 105 different questions about an app and its features, privacy settings, clinical foundations and more.
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ textAlign: 'left' }}>
        <Button style={{ borderRadius }} onClick={handleRateApp}>
          <Grid container spacing={1}>
            <Grid item>
              <Typography className={classes.primaryTextSmall}>Rate an App</Typography>
            </Grid>
            <Grid item>
              <Icons.ArrowRightAlt className={classes.arrowRight} />
            </Grid>
          </Grid>
        </Button>
      </Grid>
    </Grid>
  );
}
