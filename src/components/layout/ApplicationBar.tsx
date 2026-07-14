import * as React from 'react';
import {
  Box,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Divider,
  Slide,
  Button,
  ButtonGroup,
  Typography
} from '@mui/material';
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
      // Visible on all sizes: opens the temporary drawer on mobile and
      // toggles the collapsible filter panel on desktop.
      marginLeft: 0,
      color: grey[900]
    },
    navDrawerPaper: {
      width: 280
    },
    navDrawerHeader: {
      padding: 16
    },
    navListItem: {
      borderRadius: 10,
      margin: '2px 8px',
      color: palette.text.primary,
      '& .MuiListItemIcon-root': {
        color: palette.text.secondary,
        minWidth: 40
      }
    },
    navListItemActive: {
      color: palette.primary.dark,
      background: `${palette.primary.main}14`,
      '& .MuiListItemIcon-root': {
        color: palette.primary.dark
      }
    },
    navSectionLabel: {
      padding: '16px 16px 4px',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: palette.text.secondary
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

// Shared by the desktop tab bar and the mobile nav drawer so they can never
// disagree about which tabs a given user gets to see.
const useVisibleTabs = () => {
  const isAdmin = useIsAdmin();
  const signedInRater = useSignedInRater();
  const tabs = useTabs();
  return tabs.filter(t => (t.id === 'My Ratings' ? signedInRater : !isAdmin ? (t.id === 'Admin' ? false : true) : true));
};

const AppBarTabSelector = props => {
  const tabs = useVisibleTabs();
  const { pathname } = useLocation();
  const nullTab = noTabPaths.findIndex(p => p === pathname) > -1 ? true : false;

  return <TabSelectorToolBar id={id} value={nullTab ? null : undefined} tabs={tabs} {...props} />;
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
    //console.log('Exporting sign up surveys...', { data, columns });
    exportTableCsv(data, columns);
  }, [getSignUpSurveys]);

  const handleExportPwaUsage = React.useCallback(async () => {
    var data = await getPwaUsage();
    //console.log('Exporting pwa usage...', { data, trackingColumns });
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
  const visibleTabs = useVisibleTabs();
  const { pathname } = useLocation();
  // The Lite/Pro version toggle only makes sense while browsing the app
  // library (it controls which filter/question set shows there) — everywhere
  // else it's just nav-bar clutter.
  const isAppsPage = pathname.toLowerCase().endsWith('/apps');

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

  // Below 'md' there isn't room for the tab bar + version toggle + account
  // icon, so navigation collapses into a hamburger-driven drawer.
  const isMobileNav = useFullScreen('md');
  const [navDrawerOpen, setNavDrawerOpen] = React.useState(false);
  const closeNavDrawer = React.useCallback(() => setNavDrawerOpen(false), [setNavDrawerOpen]);

  const [leftDrawerOpen, setLeftDrawerOpen, leftDrawerEnabled] = useLeftDrawer();
  const handleOpenLeftDrawer = React.useCallback(() => setLeftDrawerOpen(!leftDrawerOpen), [setLeftDrawerOpen, leftDrawerOpen]);

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
          //setLoginState(prev => ({ ...prev, open: true }));
          setLayout({ version: newVersion }); // Don't require sign up for pro version any more
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
            {isMobileNav ? (
              <Grid container alignItems='center' wrap='nowrap' spacing={0}>
                {/* Hamburger (site nav) and filter toggle (page-local) are
                    grouped tight as one cluster, distinct from the logo. */}
                <Grid item>
                  <IconButton
                    aria-label='open navigation menu'
                    edge='start'
                    onClick={() => setNavDrawerOpen(true)}
                    className={classes.menuButton}
                    size='large'
                  >
                    <Icons.Menu />
                  </IconButton>
                </Grid>
                {leftDrawerEnabled && (
                  <Grid item>
                    <IconButton
                      aria-label='toggle filter panel'
                      onClick={handleOpenLeftDrawer}
                      className={classes.menuButton}
                      style={{ marginLeft: -8 }}
                      size='large'
                    >
                      <Icons.FilterList />
                    </IconButton>
                  </Grid>
                )}
                <Grid item xs style={{ minWidth: 0, marginLeft: 8 }}>
                  <Logo condensed autoHide={false} showText={false} />
                </Grid>
                <Grid item>
                  <IconButton color='inherit' aria-label='account of current user' aria-haspopup='true' onClick={handleMenu} size='large'>
                    {signedIn ? <Icons.AccountCircleTwoTone /> : <Icons.AccountCircle />}
                  </IconButton>
                </Grid>
              </Grid>
            ) : (
              <Grid container alignItems='center' spacing={0}>
                {leftDrawerEnabled && (
                  <Grid item>
                    <IconButton aria-label='toggle filter panel' edge='start' onClick={handleOpenLeftDrawer} className={classes.menuButton} size='large'>
                      <Icons.FilterList />
                    </IconButton>
                  </Grid>
                )}
                <Grid item>
                  <Logo />
                </Grid>
                <Grid item xs style={{ minWidth: 0 }}>
                  <AppBarTabSelector onChange={handleTabChange} />
                </Grid>
                <Grid item>
                  <Grid container justifyContent='flex-end' alignItems='center'>
                    {isAppsPage && (
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
                            {/*<Icons.Lock sx={{ fontSize: 16, mr: 0.5 }} />*/}
                            Pro Version
                          </Button>
                        </ButtonGroup>
                      </Grid>
                    )}
                    <Grid item>
                      <IconButton color='inherit' aria-label='account of current user' aria-haspopup='true' onClick={handleMenu} size='large'>
                        {signedIn ? <Icons.AccountCircleTwoTone /> : <Icons.AccountCircle />}
                      </IconButton>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}
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
                            //{ label: 'Sign Up for Pro Version', Module: RegisterProDialog, onClick: handleClose },
                            { label: 'Sign Up for App Rater', Module: RegisterDialog, onClick: handleClose }
                            // { label: 'Take Tour', onClick: handleTour }
                          ].map(({ label, Module, onClick }) => (
                            <DialogButton key={label} Module={Module} onClick={onClick} variant='menuitem' tooltip='' mount={false}>
                              {label}
                            </DialogButton>
                          ))}
                    </Menu>
          </Toolbar>
        </AppBar>
      </Slide>
      <Drawer anchor='left' open={navDrawerOpen} onClose={closeNavDrawer} classes={{ paper: classes.navDrawerPaper }}>
        <div className={classes.navDrawerHeader}>
          <Logo autoHide={false} showText={true} />
        </div>
        <Divider />
        <List>
          {visibleTabs.map(t => {
            const active = (t.routes ?? [t.route]).some(r => r?.toLowerCase() === pathname.toLowerCase());
            return (
              <ListItemButton
                key={t.id}
                className={`${classes.navListItem} ${active ? classes.navListItemActive : ''}`}
                onClick={() => {
                  closeNavDrawer();
                  t.onClick && t.onClick();
                  handleTabChange(t.id);
                }}
              >
                <ListItemIcon>
                  <t.icon />
                </ListItemIcon>
                <ListItemText primary={t.id} />
              </ListItemButton>
            );
          })}
        </List>
        {isAppsPage && (
          <>
            <Divider />
            <Typography className={classes.navSectionLabel}>Version</Typography>
            <Box sx={{ px: 2, pb: 2 }}>
              <ButtonGroup variant='outlined' fullWidth aria-label='version button group'>
                <Button color={version === 'lite' ? 'primary' : 'inherit'} onClick={handleChangeVersion({ version: 'lite' })}>
                  Lite
                </Button>
                <Button color={version !== 'lite' ? 'primary' : 'inherit'} onClick={handleChangeVersion({ version: 'full' })}>
                  Pro
                </Button>
              </ButtonGroup>
            </Box>
          </>
        )}
      </Drawer>
    </>
  );
}
