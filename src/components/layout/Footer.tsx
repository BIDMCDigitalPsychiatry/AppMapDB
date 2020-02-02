import * as React from 'react';
import { makeStyles, createStyles, Toolbar, Link, AppBar, Typography, Grid } from '@material-ui/core';
import { theme } from '../../constants';

const useStyles = makeStyles(({ zIndex }: any) =>
  createStyles({
    bottomAppBar: {
      top: 'auto',
      bottom: 0,
      zIndex: zIndex.drawer + 1,
    },
    bottomToolBar: {
      minHeight: (theme as any).layout.footerheight,
    },
  } as any)
);

export default function Footer() {
  const classes = useStyles({});

  return (
    <AppBar position='fixed' color='primary' className={classes.bottomAppBar}>
      <Toolbar className={classes.bottomToolBar}>
        <Grid container justify='space-between'>
          <Grid item xs={4}>
            <Typography noWrap variant='body2'>
              <Link href='https://www.digitalpsych.org/' target='_blank' variant='body2' color='inherit'>
                Division of Digital Psychiatry
              </Link>
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography noWrap variant='body2' align='right'>
              <Link href='https://www.bidmc.org/' target='_blank' variant='body2' color='inherit'>
                ©2020 Beth Israel Deaconess Medical Center
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
