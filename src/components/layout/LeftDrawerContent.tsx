import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import FilterContentLeftDrawer from '../application/GenericContent/Filter/FilterContentLeftDrawer';
import { useTableFilterValues } from '../application/GenericTable/store';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%'
    },
    searchFilters: {
      color: theme.palette.primary.light,
      fontWeight: 500
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
    header: {
      color: theme.palette.primary.dark
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

export default function LeftDrawerContent() {
  const classes = useStyles();

  const [, setValues] = useTableFilterValues('Applications');

  const handleReset = React.useCallback(() => setValues({}), [setValues]);

  return (
    <>
      <Box p={1}>
        <Box p={0}>
          <Typography variant='caption' color='textPrimary' className={classes.searchFilters}>
            Search Filters
          </Typography>
          <Box mt={1}>
            <FilterContentLeftDrawer />
          </Box>
        </Box>
      </Box>
      <Box textAlign='center' mb={2}>
        <Button variant='outlined' onClick={handleReset} className={classes.button}>
          Reset All Filters
        </Button>
      </Box>
    </>
  );
}
