import * as React from 'react';
import { Grid, Typography, Button } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useFullScreen } from '../../../hooks';
import useFilterList from '../../../database/useFilterList';
import { useHeaderHeightSetRef } from '../../layout/ViewPort/hooks/useHeaderHeightSetRef';

const padding = 32;
const borderRadius = 7;

const getMobilePadding = breakpoints => ({
  padding,
  fontWeight: 900,
  [breakpoints.down('sm')]: {
    padding: getPadding('sm')
  },
  [breakpoints.down('xs')]: {
    padding: getPadding('xs')
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
      fontWeight: 900,
      color: palette.primary.dark
    },
    secondaryText: {
      fontSize: 20,

      color: palette.common.white
    }
  })
);

export default function RateNewAppHeader({ onSave = undefined, onReset = undefined }) {
  const classes = useStyles();
  useFilterList();

  var sm = useFullScreen('sm');

  return (
    <Grid ref={useHeaderHeightSetRef()} container className={classes.header}>
      <Grid item xs={12}>
        <Typography variant='h1' className={classes.primaryText}>
          Rate an App
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container style={{ marginTop: 8 }} alignItems='center' spacing={4}>
          <Grid item xs={12} sm style={{ marginTop: -4 }}>
            <Typography className={classes.secondaryText}>
              On the following pages, you will be guided through each of the 105 questions. You will be able to save your progress as a draft.
            </Typography>
          </Grid>
          <Grid item xs={sm ? 12 : undefined} style={{ textAlign: 'right' }}>
            <Grid container spacing={2}>
              {onReset && (
                <Grid item>
                  <Button className={classes.primaryButton} onClick={onReset}>
                    Reset Form
                  </Button>
                </Grid>
              )}
              {onSave && (
                <Grid item>
                  <Button className={classes.primaryButton} onClick={onSave}>
                    Save as Draft
                  </Button>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
