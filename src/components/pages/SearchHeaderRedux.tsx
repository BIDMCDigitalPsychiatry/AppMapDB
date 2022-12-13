import * as React from 'react';
import { Box, Grid, Typography, Chip } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useFullScreen, useIsAdmin } from '../../hooks';
import useFilterList from '../../database/useFilterList';
import TableSearchV2 from '../application/GenericTable/TableSearchV2';
import MultiSelectCheck from '../application/DialogField/MultiSelectCheck';
import { Platforms, withReplacement } from '../../database/models/Application';
import { useHandleTableReset, useTableFilterValues, useTableSearchText } from '../application/GenericTable/store';
import DialogButton from '../application/GenericDialog/DialogButton';
import ViewModeButtons from '../application/GenericTable/Applications/ViewModeButtons';
import { categories } from '../../constants';
import useWidth from '../layout/ViewPort/hooks/useWidth';
import { useChangeRoute, useHeaderHeightSetRef } from '../layout/hooks';
import TourStep from './Tour/TourStep';
import { publicUrl } from '../../helpers';
import InteractiveSearchCard from '../application/GenericDialog/InteractiveSearch/InteractiveSearchCard';
import useQuizOptions from './useQuizOptions';

const padding = 32;
const spacing = 1;

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
    primaryText: {
      fontSize: 30,
      fontWeight: 900,
      color: palette.primary.dark
    },
    deleteIcon: {
      color: 'white !important'
    }
  })
);

const Buttons = ({ onExport, collapsed }) => {
  const changeRoute = useChangeRoute();
  const onNext = React.useCallback(() => {
    changeRoute(publicUrl('/Home'));
  }, [changeRoute]);
  return (
    <TourStep id={8} onNext={onNext} onClose={onNext}>
      <ViewModeButtons onExport={onExport} collapsed={collapsed} />
    </TourStep>
  );
};

const tableId = 'Applications';

export default function SearchHeaderRedux({ title = 'App Library', onExport = undefined }) {
  const [searchtext, setSearchText] = useTableSearchText(tableId);
  const [filters = {}, setFilterValues] = useTableFilterValues(tableId);
  const handleReset = useHandleTableReset(tableId);

  const classes = useStyles();
  useFilterList();

  var sm = useFullScreen('sm');
  const fullScreen = useFullScreen();

  const handleChange = React.useCallback(
    id => (event: any) => {
      const value = event?.target?.value;
      if (id === 'searchtext') {
        setSearchText(value);
      } else {
        setFilterValues(prev => ({ ...prev, [id]: value }));
      }
    },
    [setSearchText, setFilterValues]
  );

  const items = Object.keys(filters)
    .filter(k => (k !== 'Platforms' && k !== 'SavedFilter') || (k === 'Platforms' && fullScreen))
    .map(k => ({ key: k, label: k, value: filters[k] }));

  const handleDelete = React.useCallback(
    (key, value) => () => setFilterValues(prev => ({ ...prev, [key]: (prev[key] ?? []).filter(v => v !== value) })),
    [setFilterValues]
  );

  let showClear = false;

  const width = useWidth();
  const isAdmin = useIsAdmin();
  const collapseMobile = width < 420;
  const collapsed = collapseMobile || (isAdmin && !fullScreen && width < 1050) || (isAdmin && fullScreen && width < 720);

  const setRef = useHeaderHeightSetRef();

  const { state, setState, handleSearch } = useQuizOptions();

  return (
    <>
      <Grid ref={setRef} container style={{ paddingTop: collapseMobile ? 0 : undefined }} className={classes.header}>
        {!collapseMobile && (
          <Grid item xs={12}>
            <Grid container justifyContent='space-between' alignItems='flex-end'>
              <Grid>
                <Typography variant='h1' className={classes.primaryText}>
                  {title}
                </Typography>
              </Grid>
              <Grid item>
                <Buttons onExport={onExport} collapsed={collapsed} />
              </Grid>
            </Grid>
          </Grid>
        )}
        <Grid item xs={12}>
          <Grid container style={{ marginTop: 8 }} alignItems='center' spacing={0}>
            <Grid item xs={12} sm style={{ marginTop: -4 }}>
              <Grid container alignItems='center' spacing={spacing}>
                <Grid item xs>
                  <TableSearchV2 value={searchtext} onChange={handleChange('searchtext')} placeholder='Search by name, company, feature or platform' />
                </Grid>
                {collapseMobile && (
                  <Grid item>
                    <Buttons onExport={onExport} collapsed={collapsed} />
                  </Grid>
                )}
                {!fullScreen && (
                  <Grid item xs={sm ? 12 : undefined} style={{ minWidth: sm ? undefined : 360 }}>
                    <MultiSelectCheck
                      value={filters['Platforms']}
                      onChange={handleChange('Platforms')}
                      placeholder={filters['Platforms']?.length > 0 ? 'Platforms' : 'All Platforms'}
                      InputProps={{ style: { background: 'white' } }}
                      items={Platforms.map(label => ({ value: label, label })) as any}
                      fullWidth={true}
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container justifyContent='space-between' alignItems='center'>
            <Grid item xs>
              <Grid container alignItems='center' spacing={1} style={{ marginTop: 0 }}>
                {items.map((item, i) => {
                  const category = categories[item.key];
                  if (item.value.length > 0) {
                    showClear = true;
                  }
                  return !Array.isArray(item?.value) ? (
                    <></>
                  ) : (
                    item.value.map((label, i2) => (
                      <Grid item key={label}>
                        <Chip
                          key={`${label}-${i}-${i2}`}
                          style={{ background: category?.color ?? 'grey', color: 'white', marginRight: 8 }}
                          variant='outlined'
                          size='small'
                          label={withReplacement(label)}
                          onDelete={handleDelete(item.key, label)}
                          classes={{
                            deleteIcon: classes.deleteIcon
                          }}
                        />
                      </Grid>
                    ))
                  );
                })}
                {showClear && (
                  <Grid item>
                    <DialogButton variant='link' color='textSecondary' underline='always' tooltip='Click to reset all filters' onClick={handleReset}>
                      Reset all filters
                    </DialogButton>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Box style={{ marginBottom: 8 }}>
        <InteractiveSearchCard handleSearch={handleSearch} state={state} setState={setState} />
      </Box>
    </>
  );
}
