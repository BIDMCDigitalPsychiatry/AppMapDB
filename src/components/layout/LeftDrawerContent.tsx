import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Box, Divider, Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import FilterContentLeftDrawer from '../application/GenericContent/Filter/FilterContentLeftDrawer';
import { useTableFilterValues } from '../application/GenericTable/store';
import { useFilterCount } from './useFilterCount';
import StyledBadge from './StyledBadge';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      padding: 8
    },
    primaryText: {
      fontSize: 18,
      fontWeight: 700,
      color: theme.palette.primary.dark
    },
    button: {
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1)
    }
  })
);

export const steps = [{ label: 'Pre-Survey' }, { label: 'Lessons' }, { label: 'Post-Survey' }, { label: 'Resources' }];

export default function LeftDrawerContent({ table = 'Applications' }) {
  const classes = useStyles();

  const [, setValues] = useTableFilterValues(table);
  const filterCount = useFilterCount(table);

  const handleReset = React.useCallback(() => setValues({}), [setValues]);

  return (
    <>
      <div className={classes.header}>
        <Grid container justify='space-between'>
          <Grid item xs>
            <Typography variant='caption' color='textPrimary' className={classes.primaryText}>
              Search Filters
            </Typography>
          </Grid>
          <Grid item>
            <StyledBadge badgeContent={filterCount} color='primary' />
          </Grid>
        </Grid>
      </div>
      <Box ml={1} mr={1} mb={1}>
        <Divider />
      </Box>
      <FilterContentLeftDrawer />
      <Box textAlign='center' mb={2}>
        <Button variant='outlined' onClick={handleReset} className={classes.button}>
          Reset All Filters
        </Button>
      </Box>
    </>
  );
}
