import * as React from 'react';
import { Grid, Typography, createStyles, makeStyles, Button } from '@material-ui/core';
import { useFullScreen } from '../../hooks';
import useFilterList from '../../database/useFilterList';
import { useChangeRoute } from '../layout/hooks';
import { publicUrl } from '../../helpers';
import { useTableValues } from '../application/GenericTable/store';

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

export default function RateAnAppHeader({ title, state, setState = undefined }) {
  const [, setValues] = useTableValues('Applications');

  const classes = useStyles();
  useFilterList();

  var sm = useFullScreen('sm');

  // Sets the associated values in the redux store
  const setTableState = React.useCallback(() => {
    const { searchtext, ...filters } = state;
    setValues(prev => ({ searchtext, filters: { ...prev.filters, ...filters } }));
    // eslint-disable-next-line
  }, [setValues, JSON.stringify(state)]);

  const changeRoute = useChangeRoute();

  const handleSearch = React.useCallback(() => {
    setTableState();
    changeRoute(publicUrl('/Apps'));
  }, [changeRoute, setTableState]);

  return (
    <Grid container className={classes.header}>
      <Grid item xs={12}>
        <Typography variant='h1' className={classes.primaryText}>
          Rate an App
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container style={{ marginTop: 8 }} alignItems='center' spacing={4}>
          <Grid item xs={12} sm style={{ marginTop: -4 }}>
            <Typography className={classes.secondaryText}>
              Rate a new app or update an existing rating by entering the relevant app store link. You will be prompted through 105 different questions about
              the app and its features, privacy settings, and clinical foundation.
            </Typography>
          </Grid>
          <Grid item xs={sm ? 12 : undefined} style={{ textAlign: 'right' }}>
            <Button className={classes.primaryButton} onClick={handleSearch}>
              Start App Rating
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
