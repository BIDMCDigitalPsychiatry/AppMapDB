import * as React from 'react';
import { Grid, createStyles, makeStyles, Typography, Link } from '@material-ui/core';
import Logo from '../layout/Logo';
import Questions from '../layout/Questions';
import { useFooterHeightRef, useHandleChangeRoute } from './hooks';
import { useFullScreen } from '../../hooks';
import { useWidth } from './store';

const spacing = 3;

const useStyles = makeStyles(({ breakpoints, palette, spacing }) =>
  createStyles({
    root: {
      padding: spacing(1, 0),
      [breakpoints.up('md')]: {
        padding: spacing(2, 0)
      },
      background: palette.secondary.light
    },
    container: {
      width: '100%',
      margin: '0 auto',
      padding: spacing(0, 2)
    },
    link: {
      fontSize: 18,
      color: palette.primary.dark,
      cursor: 'pointer'
    }
  })
);
const tabs = [
  { id: 'Find an APP', route: '/Home' },
  { id: 'App Library', route: '/Apps' },
  { id: 'Framework', route: '/FrameworkQuestions' },
  { id: 'News', route: '/News' },
  { id: 'Privacy Policy', route: '/Apps' }
];

export default function FooterV2() {
  const classes = useStyles();
  const fs = useFullScreen();

  const handleChangeRoute = useHandleChangeRoute();

  const width = useWidth();
  var showText = width <= 660 ? false : true;

  return (
    <div ref={useFooterHeightRef()} className={classes.root}>
      <Grid container className={classes.container} spacing={spacing}>
        <Grid item xs={12}>
          <Grid container justify='space-between' spacing={spacing}>
            <Grid item>
              <Logo autoHide={false} showText={showText} />
            </Grid>
            <Grid item xs>
              <Questions />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs style={{ minWidth: 0 }}>
          <Grid container justify='space-between' spacing={spacing}>
            {tabs.map(({ id, route }) => (
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
