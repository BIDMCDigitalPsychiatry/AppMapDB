import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Badge, Box, Divider, Grid, withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import FilterContentLeftDrawer from '../application/GenericContent/Filter/FilterContentLeftDrawer';
import { useTableFilterValues } from '../application/GenericTable/store';
import { useFilterCount } from './useFilterCount';

const StyledBadge = withStyles(theme =>
  createStyles({
    badge: {
      height: 32,
      width: 32,
      top: 4,
      right: 14,
      border: `1px solid ${theme.palette.grey[400]}`,
      background: theme.palette.primary.light
    }
  })
)(Badge);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%'
    },
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
    },
    actionsContainer: {
      marginBottom: theme.spacing(2)
    },
    resetContainer: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2)
    },
    container: {
      marginTop: 8,
      marginBottom: 8
    },
    stepper: {
      background: 'inherit',
      color: 'inherit'
    },
    stepLabelActive: {
      color: 'white !important'
    },
    stepLabelCompleted: {
      color: 'white !important'
    },
    stepIconRoot: {
      color: 'transparent',
      border: `1px solid ${theme.palette.primary.main}`,
      borderRadius: 25
    },
    stepIconActive: {
      color: 'white !important'
    },
    stepIconCompleted: {
      color: 'white !important'
    },
    stepIconText: {
      fill: `${theme.palette.primary.main} !important`
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
