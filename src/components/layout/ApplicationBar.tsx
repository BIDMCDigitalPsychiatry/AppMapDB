import * as React from 'react';
import { makeStyles, Button, Grid, ButtonGroup, Typography } from '@material-ui/core';
import { createStyles } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import logo from '../../images/logo.png';
import { useLocation, useHistory } from 'react-router';
import { renderDialogModule } from '../application/GenericDialog/DialogButton';
import * as RateAppDialog from '../application/GenericDialog/RateApp';
import { useDialogState } from '../application/GenericDialog/actions';
import { useAppBarHeightRef } from './hooks';

const useStyles = makeStyles(({ breakpoints, palette, shadows, layout }: any) =>
  createStyles({
    appBar: {
      background: palette.white
    },
    logo: {
      height: layout.toolbarheight,
      [breakpoints.down('sm')]: {
        display: 'none'
      },
      cursor: 'pointer'
    },
    button: {},
    active: {
      backgroundColor: palette.primary.dark
    },
    toolbar: {
      background: palette.white,
      height: layout.toolbarheight,
      [breakpoints.down('sm')]: {
        height: 64
      }
    }
  })
);

export default function ApplicationBar() {
  const classes = useStyles();
  const { pathname } = useLocation();
  const history = useHistory();

  const changeRoute = React.useCallback(
    (route: string) => event => {
      pathname !== route && history && history.push(route); //only change pages if it is different than the current page
    },
    [history, pathname]
  );

  const [, setDialogState] = useDialogState(RateAppDialog.title);

  const handleRateApp = React.useCallback(() => {
    setDialogState({
      type: 'Add',
      open: true
    });
  }, [setDialogState]);

  return (
    <AppBar ref={useAppBarHeightRef()} position='fixed' color='inherit' elevation={0} className={classes.appBar}>
      {renderDialogModule(RateAppDialog)}
      <Toolbar className={classes.toolbar}>
        <Grid container alignItems='center' spacing={1}>
          <Grid item>
            <img className={classes.logo} src={logo} alt='logo' onClick={changeRoute('/')} />
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
                className={pathname === '/Apps' || pathname === '/' ? classes.active : undefined}
                onClick={changeRoute('/Apps')}
              >
                <Typography variant='button' noWrap>
                  Apps
                </Typography>
              </Button>
              <Button
                className={pathname === '/Framework' ? classes.active : undefined}
                onClick={changeRoute('/Framework')}
              >
                <Typography variant='button' noWrap>{`Framework & Questions`}</Typography>
              </Button>
              <Button className={pathname === '/Rating' ? classes.active : undefined} onClick={changeRoute('/Rating')}>
                <Typography variant='button' noWrap>
                  Rating Process
                </Typography>
              </Button>
              <Button className={pathname === '/Rate' ? classes.active : undefined} onClick={handleRateApp}>
                <Typography variant='button' noWrap>
                  Rate an App
                </Typography>
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
