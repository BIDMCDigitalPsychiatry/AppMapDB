import * as React from 'react';
import { makeStyles, Button, Grid, ButtonGroup, Typography, Box, Tooltip } from '@material-ui/core';
import { createStyles } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import logo from '../../images/logo.png';
import { useLocation } from 'react-router';
import { useAppBarHeightRef, useHandleChangeRoute } from './hooks';
import { publicUrl } from '../../helpers';
import * as LoginDialog from '../application/GenericDialog/Login';
import * as RegisterDialog from '../application/GenericDialog/Register';
import DialogButton from '../application/GenericDialog/DialogButton';
import { useSelector } from 'react-redux';
import firebase from 'firebase/app';
import 'firebase/auth';
import { useDialogState } from '../application/GenericDialog/useDialogState';
import { useSignedIn } from '../../hooks';

const useStyles = makeStyles(({ breakpoints, palette, layout }: any) =>
  createStyles({
    appBar: {
      background: palette.white,
      paddingLeft: layout.contentpadding,
      paddingRight: layout.contentpadding
    },
    logo: {
      height: layout.toolbarheight - 8,
      [breakpoints.down('sm')]: {
        display: 'none'
      },
      cursor: 'pointer'
    },
    active: {
      backgroundColor: palette.primary.dark
    },
    toolbar: {
      background: palette.white
    }
  })
);

export default function ApplicationBar() {
  const classes = useStyles();
  const { pathname } = useLocation();
  const handleChangeRoute = useHandleChangeRoute();
  const [{ open: registerOpen }, setRegisterState] = useDialogState(RegisterDialog.title);
  const [{ open: loginOpen }, setLoginState] = useDialogState(LoginDialog.title);
  const signedIn = useSignedIn();

  const handleLogout = React.useCallback(() => {
    registerOpen && setRegisterState(prev => ({ ...prev, open: false, loading: false })); // Close the register dialog if it happens to be open (since the button is automatically unmounted when logging in the state is controlled here)
    !loginOpen && setLoginState(prev => ({ ...prev, open: true, loading: false })); // Open the login dialog
    (firebase as any).logout();
  }, [registerOpen, loginOpen, setRegisterState, setLoginState]);

  const email = useSelector((s: any) => s.firebase.auth.email);

  return (
    <AppBar ref={useAppBarHeightRef()} position='fixed' color='inherit' elevation={0} className={classes.appBar}>
      <Toolbar className={classes.toolbar} disableGutters={true}>
        <Grid container alignItems='center' spacing={1}>
          <Grid item>
            <img className={classes.logo} src={logo} alt='logo' onClick={handleChangeRoute(publicUrl('/'))} />
          </Grid>
          <Grid item xs>
            <ButtonGroup
              variant='contained'
              size='small'
              color='primary'
              aria-label='contained primary button group'
              fullWidth={true}
              style={{ marginBottom: 8 }}
            >
              <Button
                className={pathname === publicUrl('/Apps') || pathname === publicUrl('/') ? classes.active : undefined}
                onClick={handleChangeRoute(publicUrl('/Apps'))}
              >
                <Typography variant='button' noWrap>
                  Apps
                </Typography>
              </Button>
              {/*<Button className={pathname === publicUrl('/Rating') ? classes.active : undefined} onClick={handleChangeRoute(publicUrl('/Rating'))}>
                <Typography variant='button' noWrap>
                  Rating Process
                </Typography>
              </Button>
              */}
              <Button className={pathname === publicUrl('/RateNewApp') ? classes.active : undefined} onClick={handleChangeRoute(publicUrl('/RateNewApp'))}>
                <Typography variant='button' noWrap>
                  Rate New App
                </Typography>
              </Button>
              <Button className={pathname === publicUrl('/Framework') ? classes.active : undefined} onClick={handleChangeRoute(publicUrl('/Framework'))}>
                <Typography variant='button' noWrap>
                  {`Framework & Questions`}
                </Typography>
              </Button>
              {/*<Button className={pathname === publicUrl('/PlayGround') ? classes.active : undefined} onClick={changeRoute(publicUrl('/PlayGround'))}>
                <Typography variant='button' noWrap>
                  Play Ground
                </Typography>
              </Button>
              */}
            </ButtonGroup>
          </Grid>
          {!signedIn ? (
            <>
              <Grid item>
                <Box mb={1}>
                  <DialogButton Module={RegisterDialog} variant='contained' size='small' margin='dense' tooltip=''>
                    <Typography variant='button' noWrap>
                      Sign Up
                    </Typography>
                  </DialogButton>
                </Box>
              </Grid>
              <Grid item>
                <Box mb={1}>
                  <DialogButton Module={LoginDialog} variant='contained' size='small' tooltip=''>
                    <Typography variant='button' noWrap>
                      Login
                    </Typography>
                  </DialogButton>
                </Box>
              </Grid>
            </>
          ) : (
            <>
              <Grid item>
                <Box mb={1}>
                  <Tooltip title={`Logout ${email}`}>
                    <Button variant='contained' color='primary' size='small' onClick={handleLogout}>
                      <Typography variant='button' noWrap>
                        Logout
                      </Typography>
                    </Button>
                  </Tooltip>
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
