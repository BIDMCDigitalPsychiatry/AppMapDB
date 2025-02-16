import * as React from 'react';
import { Grid, IconButton, Menu, MenuItem, Divider, Slide, Button, ButtonGroup } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { useChangeRoute, useTourStep } from './hooks';
import { publicUrl } from '../../helpers';
import * as LoginDialog from '../application/GenericDialog/LoginV2';
import * as RegisterDialog from '../application/GenericDialog/RegisterV2';
import * as RegisterProDialog from '../application/GenericDialog/RegisterPro';
import * as SignUpSurveyDialog from '../application/GenericDialog/SignUpSurvey';
import { columns } from '../application/GenericDialog/SignUpSurvey';
import DialogButton, { renderDialogModule } from '../application/GenericDialog/DialogButton';
import { useSelector } from 'react-redux';
import { useDialogState } from '../application/GenericDialog/useDialogState';
import { useSignedIn, useFullScreen, useIsAdmin, useIsTestUser, useSignedInRater, trackingColumns } from '../../hooks';
import TabSelectorToolBar from '../general/TabSelector/TabSelectorToolBar';
import * as Icons from '@mui/icons-material';
import { useLayout, useLeftDrawer, useSetUser } from './store';
import Logo from './Logo';
import { grey } from '@mui/material/colors';
import useTabSelector from '../application/Selector/useTabSelector';
import { useLocation } from 'react-router';
import { useAppBarHeightSetRef } from './hooks';
import { useGetSignUpSurveys } from '../../database/useGetSignUpSurveys';
import { exportTableCsv } from '../../database/store';
import { useGetPwaUsage } from '../../database/useGetPwaUsage';

const useStyles = makeStyles(({ breakpoints, palette, layout }: any) =>
  createStyles({
    appBar: {
      background: palette.primary.white,
      paddingLeft: layout.contentpadding,
      paddingRight: layout.contentpadding
    },
    appBarFullScreen: {
      background: palette.primary.white
    },
    active: {
      backgroundColor: palette.primary.dark
    },
    toolbar: {
      background: palette.white
    },
    accountMenuItem: {
      pointerEvents: 'none',
      background: palette.primary.light,
      color: palette.common.white
    },
    menuButton: {
      marginLeft: 0,
      color: grey[900],
      [breakpoints.up('sm')]: {
        display: 'none'
      }
    }
  })
);

const useTabs = () => {
  const [, setTabSelector] = useTabSelector('CommunitySelector');
  const handleClick = React.useCallback(() => {
    setTabSelector({ value: 'News' });
  }, [setTabSelector]);
  return [
    { id: 'Application Library', icon: Icons.Apps, route: '/Apps', routes: ['/', '', '/Home', '/Apps'] },
    { id: 'My Ratings', icon: Icons.RateReview, route: '/MyRatings' },
    { id: 'Admin', icon: Icons.Dashboard, route: '/Admin', routeState: { subRoute: 'pending' } },
    { id: 'Framework', icon: Icons.Description, route: '/FrameworkQuestions' },
    { id: 'Community', icon: Icons.Forum, route: '/Community', routeState: { subRoute: 'list', category: 'News' }, onClick: handleClick }
  ].filter(t => t);
};

const id = 'AppBar';
export const noTabPaths = ['/Home', '/'];
const AppBarTabSelector = props => {
  const isAdmin = useIsAdmin();
  const signedInRater = useSignedInRater();
  const tabs = useTabs();
  const { pathname } = useLocation();
  const nullTab = noTabPaths.findIndex(p => p === pathname) > -1 ? true : false;

  return (
    <TabSelectorToolBar
      id={id}
      value={nullTab ? null : undefined}
      tabs={tabs.filter(t => (t.id === 'My Ratings' ? signedInRater : !isAdmin ? (t.id === 'Admin' ? false : true) : true))}
      {...props}
    />
  );
};

export default function ApplicationBar({ trigger }) {
  const classes = useStyles();
  const [{ open: registerOpen }, setRegisterState] = useDialogState(RegisterDialog.title);
  const [{ open: registerProOpen }, setRegisterProState] = useDialogState(RegisterProDialog.title);
  const [{ open: signUpSurveyOpen }, setSignUpSurveyState] = useDialogState(SignUpSurveyDialog.title);
  const [{ open: loginOpen }, setLoginState] = useDialogState(LoginDialog.title);
  const signedIn = useSignedIn();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { getSignUpSurveys } = useGetSignUpSurveys();
  const { getPwaUsage } = useGetPwaUsage();

  const handleExportSignUpSurveys = React.useCallback(async () => {
    var data = await getSignUpSurveys();
    console.log('Exporting sign up surveys...', { data, columns });
    exportTableCsv(data, columns);
  }, [getSignUpSurveys]);

  const handleExportPwaUsage = React.useCallback(async () => {
    var data = await getPwaUsage();
    console.log('Exporting pwa usage...', { data, trackingColumns });
    exportTableCsv(data, trackingColumns);
  }, [getPwaUsage]);

  const setUser = useSetUser();

  const handleLogout = React.useCallback(() => {
    registerOpen && setRegisterState(prev => ({ ...prev, open: false, loading: false })); // Close the register dialog if it happens to be open (since the button is automatically unmounted when logging in the state is controlled here)
    registerProOpen && setRegisterProState(prev => ({ ...prev, open: false, loading: false })); // Close the register pro dialog if it happens to be open (since the button is automatically unmounted when logging in the state is controlled here)
    signUpSurveyOpen && setSignUpSurveyState(prev => ({ ...prev, open: false, loading: false }));
    loginOpen && setLoginState(prev => ({ ...prev, open: false, loading: false })); // Ensure login dialog is closed
    setUser(undefined); // Reset user information
    setAnchorEl(null);
  }, [
    setUser,
    registerOpen,
    registerProOpen,
    signUpSurveyOpen,
    loginOpen,
    setRegisterState,
    setRegisterProState,
    setSignUpSurveyState,
    setLoginState,
    setAnchorEl
  ]);

  const email = useSelector((s: any) => s.layout.user?.signInUserSession?.idToken?.payload?.email);

  const changeRoute = useChangeRoute();

  const tabs = useTabs();

  const handleTabChange = React.useCallback(
    value => {
      const { route, routeState = {} } = tabs.find(t => t.id === value);
      changeRoute(publicUrl(route), routeState);
    },
    [tabs, changeRoute]
  );

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = React.useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

  const fullScreen = useFullScreen('xs');

  const [, setLeftDrawerOpen, leftDrawerEnabled] = useLeftDrawer();
  const handleOpenLeftDrawer = React.useCallback(() => setLeftDrawerOpen(true), [setLeftDrawerOpen]);

  const setRef = useAppBarHeightSetRef();
  const { setStep } = useTourStep();

  const handleTour = React.useCallback(() => {
    setStep(1);
    handleClose();
    changeRoute(publicUrl('/Home'));
  }, [setStep, changeRoute, handleClose]);

  const version = useSelector((s: any) => s.layout.version);
  const [, setLayout] = useLayout();

  const handleChangeVersion = React.useCallback(
    ({ version: newVersion }) =>
      () => {
        if (!signedIn && newVersion !== 'lite') {
          // User is not signed in and trying to switch to pro version, show the login dialog
          setLoginState(prev => ({ ...prev, open: true }));
        } else {
          setLayout({ version: newVersion });
        }
      },
    [setLayout, signedIn, setLoginState]
  );

  const isAdmin = useIsAdmin();

  return (
    <>
      {/* Render/mount dialogs outside of the menu item to prevent a bug which disables the tab button in the dialog*/}
      {renderDialogModule(LoginDialog)}
      {renderDialogModule(RegisterDialog)}
      {renderDialogModule(RegisterProDialog)}
      {renderDialogModule(SignUpSurveyDialog)}
      <Slide appear={false} direction='down' in={!trigger}>
        <AppBar ref={setRef} position='fixed' color='inherit' elevation={2} className={fullScreen ? classes.appBarFullScreen : classes.appBar}>
          <Toolbar className={classes.toolbar} disableGutters={true}>
            {leftDrawerEnabled && (
              <IconButton aria-label='open drawer' edge='start' onClick={handleOpenLeftDrawer} className={classes.menuButton} size='large'>
                <Icons.Menu />
              </IconButton>
            )}
            <Grid container alignItems='center' spacing={0}>
              <Grid item>
                <Logo />
              </Grid>
              <Grid item xs style={{ minWidth: 0 }}>
                <AppBarTabSelector onChange={handleTabChange} />
              </Grid>
              <Grid item>
                <Grid container justifyContent='flex-end' alignItems='center'>
                  <Grid item>
                    <ButtonGroup variant='contained' aria-label='version button group'>
                      <Button
                        sx={{
                          '&:hover': {
                            backgroundColor: 'primary.dark'
                          }
                        }}
                        color={version === 'lite' ? 'primary' : 'secondary'}
                        onClick={handleChangeVersion({ version: 'lite' })}
                      >
                        Lite Version
                      </Button>
                      <Button
                        sx={{
                          '&:hover': {
                            backgroundColor: 'primary.dark'
                          }
                        }}
                        color={version !== 'lite' ? 'primary' : 'secondary'}
                        onClick={handleChangeVersion({ version: 'full' })}
                      >
                        <Icons.Lock sx={{ fontSize: 16, mr: 0.5 }} />
                        Pro Version
                      </Button>
                    </ButtonGroup>
                  </Grid>
                  <Grid item>
                    <IconButton color='inherit' aria-label='account of current user' aria-haspopup='true' onClick={handleMenu} size='large'>
                      {signedIn ? <Icons.AccountCircleTwoTone /> : <Icons.AccountCircle />}
                    </IconButton>
                    <Menu
                      id='menu-appbar'
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                      }}
                      open={open}
                      onClose={handleClose}
                      MenuListProps={{ style: { paddingTop: signedIn ? 0 : undefined } }}
                    >
                      {signedIn
                        ? isAdmin
                          ? [
                              <MenuItem key='email' className={classes.accountMenuItem}>
                                {email}
                              </MenuItem>,
                              <Divider key='divider' />,
                              <MenuItem key='export-sign-up-surveys' onClick={handleExportSignUpSurveys}>
                                Export Sign Up Surveys
                              </MenuItem>,
                              <MenuItem key='export-sign-up-surveys' onClick={handleExportPwaUsage}>
                                Export PWA Usage
                              </MenuItem>,
                              <MenuItem key='logout' onClick={handleLogout}>
                                Logout
                              </MenuItem>
                            ]
                          : [
                              <MenuItem key='email' className={classes.accountMenuItem}>
                                {email}
                              </MenuItem>,
                              <Divider key='divider' />,
                              <MenuItem key='logout' onClick={handleLogout}>
                                Logout
                              </MenuItem>
                            ]
                        : [
                            { label: 'Login', Module: LoginDialog, onClick: handleClose },
                            { label: 'Sign Up for Pro Version', Module: RegisterProDialog, onClick: handleClose },
                            { label: 'Sign Up for App Rater', Module: RegisterDialog, onClick: handleClose }
                            // { label: 'Take Tour', onClick: handleTour }
                          ].map(({ label, Module, onClick }) => (
                            <DialogButton key={label} Module={Module} onClick={onClick} variant='menuitem' tooltip='' mount={false}>
                              {label}
                            </DialogButton>
                          ))}
                    </Menu>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
      </Slide>
    </>
  );
}
