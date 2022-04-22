import * as React from 'react';
import { Grid, Typography, Button, Container } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import useComponentSize from '@rehooks/component-size';
import { useFullScreen } from '../../hooks';
import useFilterList from '../../database/useFilterList';
import MultiFeatureSelect from '../application/DialogField/MultiFeatureSelect';
import { Features } from '../../database/models/Application';
import { useChangeRoute, useHandleChangeRoute } from '../layout/hooks';
import { publicUrl } from '../../helpers';
import SearchHeader from './SearchHeader';
import ArrowButton from '../general/ArrowButton';
import { internalKeys } from '../application/GenericDialog/InteractiveSearch/InteractiveSearchCard';
import { useTableValues } from '../application/GenericTable/store';
import TourStep from './Tour/TourStep';
import useAppTableDataTest from './useAppTableDataTest';

const padding = 32;
const spacing = 1;
const borderRadius = 7;
const minHeight = 200;

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

const useStyles = makeStyles(({ breakpoints, palette, spacing, layout }: any) =>
  createStyles({
    header: {
      background: palette.primary.light,
      color: palette.common.white,
      fontWeight: 900,
      ...getMobilePadding(breakpoints)
    },
    features: {
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
    secondaryButton: {
      borderRadius,
      color: palette.common.white,
      background: palette.primary.light,
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
      fontSize: 30,
      fontWeight: 900,
      color: palette.common.white
    },
    searchFilters: {
      ...getMobilePadding(breakpoints),
      minHeight,
      background: palette.primary.dark,
      color: palette.common.white,
      borderRadius
    },
    rateAnApp: {
      ...getMobilePadding(breakpoints),
      minHeight,
      background: palette.secondary.light,
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

export const variableFilters = [
  {
    key: 'Cost',
    availableFilters: ['Totally Free'],
    stepKey: 'Free'
  },
  {
    key: 'Privacy',
    availableFilters: ['Has Privacy Policy', 'App Declares Data Use and Purpose'],
    stepKey: 'YesNoPrivacy'
  },
  {
    key: 'Functionalities',
    availableFilters: ['Email or Export Your Data'],
    stepKey: 'YesNoFunctionality'
  }
];

export default function Home() {
  const classes = useStyles();
  useFilterList();

  var sm = useFullScreen('sm');

  let ref = React.useRef(null);
  const { height } = useComponentSize(ref);

  const [state, setState] = React.useState({ searchtext: '', Platforms: [], Features: [], hasClinicalFoundation: false, isSpanish: false, isOffline: false });

  const handleChange = React.useCallback(
    id => (event: any) => {
      const value = event?.target?.value;
      setState(prev => ({ ...prev, [id]: value }));
    },
    [setState]
  );

  /*
  const handleClearAll = React.useCallback(
    (id, value) => () => {
      setState(prev => ({ ...prev, [id]: value }));
    },
    [setState]
  );
  */

  const handleChangeRoute = useHandleChangeRoute();

  const FeatureSection = (
    <Grid container className={classes.features} spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h6'>Search by Features</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={spacing}>
          <Grid item xs={12}>
            <Grid container spacing={spacing}>
              <Grid item xs>
                <Container maxWidth='xl'>
                  <TourStep id={4}>
                    <MultiFeatureSelect
                      value={state['Features']}
                      onChange={handleChange('Features')}
                      items={Features.map(label => ({ value: label, label })) as any}
                      fullWidth={true}
                    />
                  </TourStep>
                </Container>
              </Grid>
            </Grid>
          </Grid>
          {/*<Grid item xs={12} style={{ textAlign: 'right' }}>
            <Button onClick={handleClearAll('Features', [])} className={classes.primaryButton}>
              Clear All
            </Button>
          </Grid>
  */}
        </Grid>
      </Grid>
    </Grid>
  );

  const Cards = (
    <Grid container className={classes.features} spacing={3}>
      <Grid item xs={12} sm={6}>
        <Grid container style={{ height }} alignItems='center' spacing={spacing} className={classes.searchFilters}>
          <Grid item xs={12}>
            <Typography variant='h1' className={classes.secondaryText}>
              See all 88 Search Filters
            </Typography>
          </Grid>
          <Grid item xs={sm ? 12 : undefined}>
            <Button className={classes.secondaryButton} onClick={handleChangeRoute(publicUrl('/Apps'))}>
              Search Filters
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Grid ref={ref} container alignItems='center' spacing={spacing} className={classes.rateAnApp}>
          <Grid item xs={12}>
            <Typography variant='h5' style={{ fontWeight: 900 }}>
              Interested in rating an app?
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>
              Our database is sourced by app reviews from trained app raters. Rating an app is an interactive process. Raters will be prompted through 105
              different questions about an app and its features, privacy settings, clinical foundations and more.
            </Typography>
          </Grid>
          <Grid item xs={sm ? 12 : undefined} style={{ textAlign: 'right' }}>
            <ArrowButton label='Rate an App' onClick={handleChangeRoute(publicUrl('/RateAnApp'))} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  const [, setValues] = useTableValues('Applications');

  // Sets the associated values in the redux store
  const setTableState = React.useCallback(() => {
    const { searchtext, isSpanish, isOffline, hasClinicalFoundation, ...filters } = state;
    var filteredFilters = Object.keys(filters)
      .filter(k => !internalKeys.includes(k))
      .reduce((o, k) => {
        o[k] = filters[k];
        return o;
      }, {});

    if (isSpanish === true) {
      filteredFilters['Functionalities'] = [...(filteredFilters['Functionalities'] ?? []), 'Spanish'];
    }
    if (isOffline === true) {
      filteredFilters['Functionalities'] = [...(filteredFilters['Functionalities'] ?? []), 'Offline'];
    }
    if (hasClinicalFoundation === true) {
      filteredFilters['ClinicalFoundations'] = [...(filteredFilters['ClinicalFoundations'] ?? []), 'Supporting Studies'];
    }
    setValues({ searchtext, filters: filteredFilters });
    // eslint-disable-next-line
  }, [setValues, JSON.stringify(state)]);

  const changeRoute = useChangeRoute();

  const handleSearch = React.useCallback(() => {
    setTableState();
    changeRoute(publicUrl('/Apps'));
  }, [changeRoute, setTableState]);

  useAppTableDataTest({ trigger: false, triggerWhenEmpty: true }); // Pre load the database rows if we have an empty data set

  return (
    <TourStep id={1}>
      <TourStep id={9} onPrev={handleSearch}>
        <SearchHeader title='Explore relevant apps and reviews' handleSearch={handleSearch} state={state} setState={setState} />
        {FeatureSection}
        {Cards}
      </TourStep>
    </TourStep>
  );
}
