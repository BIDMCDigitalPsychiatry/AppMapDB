import React from 'react';
import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import { Box, Divider, Grid } from '@mui/material';
import Typography from '@mui/material/Typography';
import FilterContentLeftDrawer from '../../application/GenericContent/Filter/FilterContentLeftDrawer';
import Logo from '../Logo';
import { useFullScreen } from '../../../hooks';
import FilterCount from './FilterCount';
import TourStep from '../../pages/Tour/TourStep';
import { useHandleChangeRoute } from '../hooks';

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
  const handleChangeRoute = useHandleChangeRoute();
  return (
    <>
      <div className={classes.header}>
        <Grid container justifyContent='space-between'>
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
            <FilterCount />
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
