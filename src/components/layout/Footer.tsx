import * as React from 'react';
import { Grid, Typography, Link } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Logo from './Logo';
import Questions from './Questions';
import { useFooterHeightSetRef, useHandleChangeRoute } from './hooks';
import { useFullScreen, useIsAdmin } from '../../hooks';
import useWidth from './ViewPort/hooks/useWidth';

const spacing = 3;

const useStyles = makeStyles(({ palette, spacing }) =>
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
  { id: 'Community', route: '/Community' }
  // { id: 'Privacy Policy', route: '/Apps' }
];

export default function Footer({ variant = 'normal' }) {
  const classes = useStyles();
  const fs = useFullScreen();

  const handleChangeRoute = useHandleChangeRoute();

  const width = useWidth();
  var showText = width <= 660 ? false : true;

  const isAdmin = useIsAdmin();

  return (
    <div ref={useFooterHeightSetRef()} className={classes.root}>
      <Grid container justifyContent='center' className={classes.container} spacing={1}>
        {variant !== 'small' && (
          <Grid item xs={12}>
            <Grid container justifyContent='space-between' spacing={spacing}>
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
          <Grid container justifyContent='space-between' spacing={spacing}>
            {tabs
              .filter(t => (!isAdmin ? (t.id === 'Admin' ? false : true) : true))
              .map(({ id, route }) => (
                <Grid key={id} item>
                  <Link className={classes.link} onClick={handleChangeRoute(route)} variant='h1'>
                    {id}
                  </Link>
                </Grid>
              ))}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container justifyContent='flex-start'>
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
              <Typography noWrap align='right'></Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
