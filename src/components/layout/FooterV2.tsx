import * as React from 'react';
import { Grid, createStyles, makeStyles, Typography, Link } from '@material-ui/core';
import Logo from '../layout/Logo';
import Questions from '../layout/Questions';
import { useFooterHeightRef, useHandleChangeRoute } from './hooks';
import { useFullScreen, useIsAdmin } from '../../hooks';
import { useWidth } from './store';

const spacing = 3;

const useStyles = makeStyles(({ breakpoints, palette, spacing }) =>
  createStyles({
    root: {
      background: palette.secondary.light,
      padding: 16
    },
    container: {
      width: '100%'
    },
    link: {
      fontSize: 18,
      color: palette.primary.dark,
      cursor: 'pointer'
    }
  })
);

const tabs = [
  { id: 'Admin', route: '/Admin' },
  { id: 'Find an APP', route: '/Home' },
  { id: 'App Library', route: '/Apps' },
  { id: 'Framework', route: '/FrameworkQuestions' },
  { id: 'News', route: '/News' }
  // { id: 'Privacy Policy', route: '/Apps' }
];

export default function FooterV2({ variant = 'normal' }) {
  const classes = useStyles();
  const fs = useFullScreen();

  const handleChangeRoute = useHandleChangeRoute();

  const width = useWidth();
  var showText = width <= 660 ? false : true;

  const isAdmin = useIsAdmin();

  return (
    <div ref={useFooterHeightRef()} className={classes.root}>
      <Grid container justify='center' className={classes.container} spacing={1}>
        {variant !== 'small' && (
          <Grid item xs={12}>
            <Grid container justify='space-between' spacing={spacing}>
              <Grid item style={{ marginTop: 8, marginLeft: -8 }}>
                <Logo autoHide={false} showText={showText} />
              </Grid>
              <Grid item xs>
                <Questions />
              </Grid>
            </Grid>
          </Grid>
        )}
        <Grid item xs style={{ minWidth: 0 }}>
          <Grid container justify='space-between' spacing={spacing}>
            {tabs
              .filter(t => (!isAdmin ? (t.id === 'Admin' ? false : true) : true))
              .map(({ id, route }) => (
                <Grid item>
                  <Link className={classes.link} onClick={handleChangeRoute(route)} variant='h1'>
                    {id}
                  </Link>
                </Grid>
              ))}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container justify='flex-start'>
            <Grid item xs={fs ? 5 : 2} zeroMinWidth>
              <Typography noWrap align='left'>
                <Link href='https://www.digitalpsych.org/' variant='caption' target='_blank' color='inherit'>
                  Division of Digital Psychiatry
                </Link>
              </Typography>
            </Grid>
            {!fs && (
              <Grid item xs={7} zeroMinWidth>
                <Typography noWrap align='center'>
                  <Link href='https://www.argosyfnd.org/' variant='caption' target='_blank' color='inherit'>
                    This website is made possible by support from the Argosy Foundation
                  </Link>
                </Typography>
              </Grid>
            )}
            <Grid item xs={fs ? 7 : 3} zeroMinWidth>
              <Typography noWrap align='right'>
                <Link href='https://www.bidmc.org/' variant='caption' target='_blank' color='inherit'>
                  ©2020 Beth Israel Deaconess Medical Center
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
