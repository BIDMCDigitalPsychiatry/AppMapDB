import * as React from 'react';
import { Box, Grid, Chip } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useFullScreen } from '../../hooks';
import TableSearchV2 from '../application/GenericTable/TableSearchV2';
import MultiSelectCheck from '../application/DialogField/MultiSelectCheck';
import { Platforms, withReplacement } from '../../database/models/Application';
import { useHandleTableReset, useTableFilterValues, useTableSearchText } from '../application/GenericTable/store';
import DialogButton from '../application/GenericDialog/DialogButton';
import { categories } from '../../constants';
import { useHeaderHeightSetRef } from '../layout/hooks';

const padding = 8;
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

const tableId = 'Applications';

export default function PwaSearchHeader() {
  const [searchtext, setSearchText] = useTableSearchText(tableId);
  const [filters = {}, setFilterValues] = useTableFilterValues(tableId);
  const handleReset = useHandleTableReset(tableId);

  const classes = useStyles();
  // useFilterList();

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
  const setRef = useHeaderHeightSetRef();

  return (
    <>
      <Grid ref={setRef} container style={{ paddingTop: 0 }} className={classes.header}>
        <Grid item xs={12}>
          <Grid container style={{ marginTop: 4 }} alignItems='center' spacing={0}>
            <Grid item xs={12} sm style={{ marginTop: -4 }}>
              <Grid container alignItems='center' spacing={spacing}>
                <Grid item xs>
                  <TableSearchV2 value={searchtext} onChange={handleChange('searchtext')} placeholder='Search by name, company, feature or platform' />
                </Grid>
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
              <Grid container alignItems='center' spacing={0.5} style={{ marginTop: 0 }}>
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
                          style={{ background: category?.color ?? 'grey', color: 'white', marginRight: 0 }}
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
                    <Box sx={{ pl: 1 }}>
                      <DialogButton variant='link' color='textSecondary' underline='always' tooltip='Click to reset all filters' onClick={handleReset}>
                        Reset all filters
                      </DialogButton>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
