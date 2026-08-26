import * as React from 'react';
import { Grid, Typography, Button } from '@mui/material';
import { createStyles } from '../../styles/jss';
import { makeStyles } from '../../styles/jss';
import { useFullScreen } from '../../hooks';
import { useHandleChangeRoute, useHeaderHeightSetRef } from '../layout/hooks';
import { publicUrl } from '../../helpers';

const padding = 32;
const borderRadius = 7;

// Tighter vertical rhythm: keep the horizontal padding, halve the vertical.
const getMobilePadding = breakpoints => ({
  padding: `16px ${padding}px`,
  fontWeight: 900,
  [breakpoints.down('sm')]: {
    padding: `12px ${getPadding('sm')}px`
  },
  [breakpoints.down('xs')]: {
    padding: `8px ${getPadding('xs')}px`
  }
});

const getPadding = (bp, multiplier = 1) => (bp === 'sm' ? padding / 2 : bp === 'xs' ? padding / 3 : padding) * multiplier;

const useStyles = makeStyles(({ breakpoints, palette }: any) =>
  createStyles({
    header: {
      background: palette.primary.light,
      color: palette.common.white,
      fontWeight: 900,
      ...getMobilePadding(breakpoints)
    },
    primaryButton: {
      borderRadius,
      color: palette.common.white,
      background: palette.primary.dark,
      minWidth: 160,
      height: 40,
      '&:hover': {
        background: palette.primary.main
      }
    },
    primaryText: {
      fontSize: 30,
      lineHeight: 1.2,
      fontWeight: 900,
      color: palette.primary.dark
    },
    secondaryText: {
      fontSize: 16,
      color: palette.common.white
    }
  })
);

export default function RateAnAppHeader({ showArchived = undefined, onToggleArchive = undefined }) {
  const classes = useStyles();
  // useFilterList();

  var sm = useFullScreen('sm');

  const handleChangeRoute = useHandleChangeRoute();

  return (
    <Grid ref={useHeaderHeightSetRef()} container className={classes.header}>
      <Grid item xs={12}>
        <Typography variant='h1' className={classes.primaryText}>
          My App Ratings
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container style={{ marginTop: 4 }} alignItems='center' spacing={2}>
          <Grid item xs={12} sm>
            <Typography className={classes.secondaryText}>
              Rate a new app or update an existing rating by entering the relevant app store link. You will be prompted through 105 different questions about
              the app and its features, privacy settings, and clinical foundation.
            </Typography>
          </Grid>
          <Grid item xs={sm ? 12 : undefined} style={{ textAlign: 'right' }}>
            <Grid container spacing={2}>
              <Grid item>
                <Button className={classes.primaryButton} onClick={onToggleArchive}>
                  {showArchived ? 'Hide Archived' : 'Show Archived'}
                </Button>
              </Grid>
              <Grid item>
                <Button className={classes.primaryButton} onClick={handleChangeRoute(publicUrl('/RateNewApp'))}>
                  Start App Rating
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
