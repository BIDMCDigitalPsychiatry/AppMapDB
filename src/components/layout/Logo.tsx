import * as React from 'react';
import { makeStyles, Grid } from '@material-ui/core';
import { createStyles } from '@material-ui/core';
import logo from '../../images/logoV2.png';
import { useHandleChangeRoute } from './hooks';
import { publicUrl } from '../../helpers';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(({ breakpoints, layout }: any) =>
  createStyles({
    logo: ({ autoHide }: any) => ({
      paddingLeft: 8,
      paddingRight: 16,
      height: layout.toolbarheight - 32,
      [breakpoints.down('xs')]: {
        display: autoHide ? 'none' : 'flex'
      },
      cursor: 'pointer'
    }),
    logoText: ({ autoHide }: any) => ({
      width: 240,
      color: '#1D1D1D',
      marginTop: -6,
      letterSpacing: 4,
      [breakpoints.down('sm')]: {
        display: autoHide ? 'none' : 'flex'
      },
      cursor: 'pointer'
    })
  })
);

const logoText = 'M-HEALTH INDEX &';
const logoTextSecondary = 'NAVIGATION DATABASE';

export default function Logo({ autoHide = true, showText = true }) {
  const classes = useStyles({ autoHide });
  const handleChangeRoute = useHandleChangeRoute();

  return (
    <Grid container alignItems='center' onClick={handleChangeRoute(publicUrl('/'))}>
      <Grid item>
        <img className={classes.logo} src={logo} alt='logo' />
      </Grid>
      {showText && (
        <Grid item>
          <Grid container alignItems='center' className={classes.logoText}>
            <Grid item xs={12}>
              <Typography variant='caption'>{logoText}</Typography>
            </Grid>
            <Grid item xs={12} style={{ marginTop: -4 }}>
              <Typography variant='caption'>{logoTextSecondary}</Typography>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}
