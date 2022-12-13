import * as React from 'react';
import { Grid, Typography, Button } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useFullScreen } from '../../hooks';
import useFilterList from '../../database/useFilterList';
import TableSearchV2 from '../application/GenericTable/TableSearchV2';
import MultiSelectCheck from '../application/DialogField/MultiSelectCheck';
import { Platforms } from '../../database/models/Application';
import TourStep from './Tour/TourStep';

const padding = 32;
const spacing = 1;
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

const useStyles = makeStyles(({ breakpoints, palette, spacing, layout }: any) =>
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
    }
  })
);

export default function SearchHeader({ title = 'App Library', handleSearch, state, setState = undefined }) {
  const classes = useStyles();
  useFilterList();

  var sm = useFullScreen('sm');

  const handleChange = React.useCallback(
    id => (event: any) => {
      const value = event?.target?.value;
      setState(prev => ({ ...prev, [id]: value }));
    },
    [setState]
  );

  return (
    <>
      <Grid container className={classes.header}>
        <Grid item xs={12}>
          <Typography variant='h1' className={classes.primaryText}>
            {title}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container style={{ marginTop: 8 }} alignItems='center' spacing={spacing}>
            <Grid item xs={12} sm style={{ marginTop: -4 }}>
              <Grid container spacing={spacing}>
                <Grid item xs>
                  <TourStep id={2}>
                    <TableSearchV2
                      value={state['searchtext']}
                      onChange={handleChange('searchtext')}
                      placeholder='Search by name, company, feature or platform'
                    />
                  </TourStep>
                </Grid>
                <Grid item xs={sm ? 12 : undefined} style={{ minWidth: sm ? undefined : 360 }}>
                  <TourStep id={3}>
                    <MultiSelectCheck
                      value={state['Platforms']}
                      onChange={handleChange('Platforms')}
                      placeholder={state['Platforms']?.length > 0 ? 'Platforms' : 'All Platforms'}
                      InputProps={{ style: { background: 'white' } }}
                      items={Platforms.map(label => ({ value: label, label })) as any}
                      fullWidth={true}
                    />
                  </TourStep>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={sm ? 12 : undefined} style={{ textAlign: 'right' }}>
              <TourStep id={5} onNext={handleSearch}>
                <Button className={classes.primaryButton} onClick={handleSearch}>
                  Search
                </Button>
              </TourStep>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {/*<InteractiveSearchCard handleSearch={handleSearch} state={state} setState={setState} />*/}
    </>
  );
}
