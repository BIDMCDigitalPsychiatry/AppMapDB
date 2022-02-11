import * as React from 'react';
import { Grid } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import logo from '../../images/logoV2.png';
import { useHandleChangeRoute } from './hooks';
import { publicUrl } from '../../helpers';
import Typography from '@mui/material/Typography';

const useStyles = makeStyles(({ breakpoints, layout }: any) =>
  createStyles({
    logo: ({ condensed, autoHide }: any) => ({
      paddingLeft: condensed ? 0 : 8,
      paddingRight: condensed ? 8 : 16,
      height: layout.toolbarheight - 32,
      [breakpoints.down('xs')]: {
        display: autoHide ? 'none' : 'flex'
      },
      cursor: 'pointer'
    }),
    logoText: ({ condensed, autoHide }: any) => ({
      width: condensed ? 148 : 240,
      color: '#1D1D1D',
      marginTop: condensed ? undefined : -6,
      letterSpacing: condensed ? .5 : 4,
      [breakpoints.down('sm')]: {
        display: autoHide ? 'none' : 'flex'
      },
      cursor: 'pointer'
    })
  })
);

const logoText = 'M-HEALTH INDEX &';
const logoTextSecondary = 'NAVIGATION DATABASE';

export default function Logo({ condensed = false, autoHide = true, showText = true }) {
  const classes = useStyles({ autoHide, condensed });
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
