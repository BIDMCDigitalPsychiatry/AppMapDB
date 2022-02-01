import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Box, Divider, Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import FilterContentLeftDrawer from '../application/GenericContent/Filter/FilterContentLeftDrawer';
import { useFilterCount } from './useFilterCount';
import StyledBadge from './StyledBadge';
import FilterButtons from '../application/GenericContent/FilterButtons';
import Logo from './Logo';
import { useFullScreen } from '../../hooks';

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

export default function LeftDrawerContent({ table = 'Applications' }) {
  const classes = useStyles();

  const filterCount = useFilterCount(table);

  const xs = useFullScreen('xs');

  return (
    <>
      <div className={classes.header}>
        <Grid container justify='space-between'>
          {xs && (
            <Grid item xs={12}>
              <Logo condensed={true} autoHide={false} showText={true} />
              <Divider style={{ marginTop: 8, marginBottom: 8 }} />
            </Grid>
          )}
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
      <Box ml={1} mr={1} mb={1}>
        <Divider />
      </Box>
      <Box m={1}>
        <FilterButtons />
      </Box>
    </>
  );
}
