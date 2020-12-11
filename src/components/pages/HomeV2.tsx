import * as React from 'react';
import { Grid, Typography, createStyles, makeStyles, Button } from '@material-ui/core';
import useComponentSize from '@rehooks/component-size';
import { useFullScreen } from '../../hooks';
import useFilterList from '../../database/useFilterList';
import TableSearchV2 from '../application/GenericTable/TableSearchV2';
import MultiSelectCheck from '../application/DialogField/MultiSelectCheck';
import { Platforms } from '../../database/models/Application';
import * as Icons from '@material-ui/icons';

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

const useStyles = makeStyles(({ breakpoints, palette, layout }: any) =>
  createStyles({
    root: {
      display: 'static'
    },
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
      fontSize: 34,
      fontWeight: 900,
      color: palette.primary.dark
    },
    secondaryText: {
      fontSize: 34,
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

export default function HomeV2() {
  //const [values, setValues] = useTableFilterValues('Applications');
  //const [localTab, setLocalTab] = React.useState(0);

  const classes = useStyles();
  useFilterList();

  var sm = useFullScreen('sm');

  let ref = React.useRef(null);
  const { height } = useComponentSize(ref);

  const [state, setState] = React.useState({ TextSearch: '', Platforms });

  const handleChange = React.useCallback(
    id => (event: any) => {
      const value = event?.target?.value;
      setState(prev => ({ ...prev, [id]: value }));
    },
    [setState]
  );

  const Header = (
    <Grid container className={classes.header} spacing={spacing}>
      <Grid item xs={12}>
        <Typography variant='h1' className={classes.primaryText}>
          Explore relevant apps and reviews.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container alignItems='center' spacing={spacing}>
          <Grid item xs={12} sm style={{ marginTop: -4 }}>
            <Grid container spacing={spacing}>
              <Grid item xs>
                <TableSearchV2 placeholder='Search by name, feature or platform' /*value={state['TextSearch']} onChange={handleChange('TextSearch')} */ />
              </Grid>
              <Grid item xs={sm ? 12 : undefined} style={{ minWidth: sm ? undefined : 360 }}>
                <MultiSelectCheck
                  value={state['Platforms']}
                  onChange={handleChange('Platforms')}
                  placeholder='Platforms'
                  InputProps={{ style: { background: 'white' } }}
                  items={Platforms.map(label => ({ value: label, label })) as any}
                  fullWidth={true}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={sm ? 12 : undefined} style={{ textAlign: 'right' }}>
            <Button className={classes.primaryButton}>Search</Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  const Features = (
    <Grid container className={classes.features} spacing={spacing}>
      <Grid item xs={12}>
        <Typography variant='body2'>Search by Features</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container alignItems='center' spacing={spacing}>
          <Grid item xs={12} sm style={{ marginTop: -4 }}>
            <Grid container spacing={spacing}>
              <Grid item xs>
                <TableSearchV2 placeholder='Search by name, feature or platform' /*value={state['TextSearch']} onChange={handleChange('TextSearch')} */ />
              </Grid>
              <Grid item xs={sm ? 12 : undefined} style={{ minWidth: sm ? undefined : 360 }}>
                <MultiSelectCheck
                  value={state['Platforms']}
                  onChange={handleChange('Platforms')}
                  placeholder='Platforms'
                  InputProps={{ style: { background: 'white' } }}
                  items={Platforms.map(label => ({ value: label, label })) as any}
                  fullWidth={true}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={sm ? 12 : undefined} style={{ textAlign: 'right' }}>
            <Button className={classes.primaryButton}>Search</Button>
          </Grid>
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
            <Button className={classes.secondaryButton}>Search Filters</Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Grid ref={ref} container alignItems='center' spacing={spacing} className={classes.rateAnApp}>
          <Grid item xs={12}>
            <Typography variant='h5'>Interested in rating an app?</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>
              Our database is sourced by app reviews from trained app raters. Rating an app is an interactive process. Raters will be prompted through 105
              different questions about an app and its features, privacy settings, clinical foundations and more.
            </Typography>
          </Grid>
          <Grid item xs={sm ? 12 : undefined} style={{ textAlign: 'right' }}>
            <Button style={{ borderRadius }}>
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
      </Grid>
    </Grid>
  );

  return (
    <>
      {Header}
      {Features}
      {Cards}
    </>
  );
}
