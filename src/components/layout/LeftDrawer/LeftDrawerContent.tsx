import React from 'react';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '../../../styles/jss';
import { createStyles } from '../../../styles/jss';
import { Box, Button, Divider, Grid, IconButton, Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import * as Icons from '@mui/icons-material';
import FilterContentLeftDrawer from '../../application/GenericContent/Filter/FilterContentLeftDrawer';
import Logo from '../Logo';
import { useFullScreen } from '../../../hooks';
import TourStep from '../../pages/Tour/TourStep';
import { useHandleTableReset } from '../../application/GenericTable/store';
import { useFilterCount } from '../useFilterCount';

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

export default function LeftDrawerContent({ setLeftDrawer = undefined }) {
  const classes = useStyles();
  const xs = useFullScreen('xs');
  const handleClose = React.useCallback(() => setLeftDrawer && setLeftDrawer(false), [setLeftDrawer]);
  const handleOpen = React.useCallback(() => setLeftDrawer && setLeftDrawer(true), [setLeftDrawer]);
  const handleReset = useHandleTableReset('Applications');
  const filterCount = useFilterCount('Applications');
  return (
    <>
      <div className={classes.header}>
        <Grid container justifyContent='space-between' alignItems='center'>
          {xs && (
            <Grid item xs={12}>
              <Logo condensed={true} autoHide={false} showText={true} />
              <Divider style={{ marginTop: 8, marginBottom: 8 }} />
            </Grid>
          )}
          <Grid item xs>
            <Typography variant='caption' color='textPrimary' className={classes.primaryText}>
              Filters
            </Typography>
          </Grid>
          <Grid item style={{ display: 'flex', alignItems: 'center' }}>
            {filterCount > 0 && (
              <Button size='small' onClick={handleReset} style={{ textTransform: 'none', fontWeight: 600 }}>
                Clear all ({filterCount})
              </Button>
            )}
            <Tooltip title='Hide filters'>
              <IconButton size='small' onClick={handleClose} aria-label='hide filter panel'>
                <Icons.ChevronLeft />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </div>
      <Box ml={1} mr={1} mb={1}>
        <Divider />
      </Box>
      <TourStep id={7} onOpen={handleOpen} onPrev={handleClose} onNext={handleClose} onClose={handleClose}>
        <FilterContentLeftDrawer />
      </TourStep>
    </>
  );
}
