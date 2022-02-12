import * as React from 'react';
import { Grid, Typography, Button } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useFullScreen } from '../../hooks';
import useFilterList from '../../database/useFilterList';
import TableSearchV2 from '../application/GenericTable/TableSearchV2';
import MultiSelectCheck from '../application/DialogField/MultiSelectCheck';
import { Platforms } from '../../database/models/Application';
import { useTableFilterValues, useTableSearchText } from '../application/GenericTable/store';
import { useHeaderHeightSetRef } from '../layout/hooks';

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

const useStyles = makeStyles(({ breakpoints, palette, spacing, layout }: any) =>
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
    primaryButton: {
      borderRadius: 7,
      color: palette.common.white,
      background: palette.primary.dark,
      minWidth: 160,
      height: 40,
      '&:hover': {
        background: palette.primary.main
      }
    }
  })
);
const tableId = 'Applications';
export default function SearchHeaderReduxPending({ title = 'Pending Approvals', showArchived = undefined, onToggleArchive = undefined }) {
  const [searchtext, setSearchText] = useTableSearchText(tableId);
  const [filters = {}, setFilterValues] = useTableFilterValues(tableId);

  const classes = useStyles();
  useFilterList();

  var sm = useFullScreen('sm');

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

  const fullScreen = useFullScreen();

  return (
    <Grid ref={useHeaderHeightSetRef()} container className={classes.header}>
      <Grid item xs={12}>
        <Grid container justifyContent='space-between'>
          <Grid item xs>
            <Typography variant='h1' className={classes.primaryText}>
              {title}
            </Typography>
          </Grid>
          <Grid item>
            <Button className={classes.primaryButton} onClick={onToggleArchive}>
              {showArchived ? 'Hide Archived' : 'Show Archived'}
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container style={{ marginTop: 8 }} alignItems='center' spacing={spacing}>
          <Grid item xs={12} sm style={{ marginTop: -4 }}>
            <Grid container spacing={spacing}>
              <Grid item xs>
                <TableSearchV2 value={searchtext} onChange={handleChange('searchtext')} placeholder='Search by name, feature or platform' />
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
    </Grid>
  );
}
