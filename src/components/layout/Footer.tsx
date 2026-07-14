import * as React from 'react';
import { Box, Divider, Link, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Logo from './Logo';
import { useFooterHeightSetRef, useHandleChangeRoute } from './hooks';
import { useIsAdmin } from '../../hooks';
import pkg from '../../../package.json';

// Flexbox + gap throughout (no MUI Grid `spacing`): Grid's spacing relies on
// a negative container margin to offset padding it adds to every item: any
// other margin on that same container (e.g. for centering) cancels the
// negative margin but not the padding, leaking uncompensated space in and
// misaligning rows that don't share the same Grid spacing. Both top and
// bottom rows here share one `container` class so their left edges match.
const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    root: {
      // Visibly distinct from the page's own #F7F9FC background so the
      // footer's actual start (vs. empty page space above it) is unambiguous.
      background: '#EEF2F7',
      borderTop: `1px solid ${palette.divider ?? '#E5EAF0'}`,
      padding: '16px 24px 8px'
    },
    container: {
      maxWidth: 1160,
      margin: '0 auto'
    },
    columns: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 32
    },
    column: {
      minWidth: 160,
      flex: '1 1 200px'
    },
    brandColumn: {
      minWidth: 240,
      flex: '1 1 280px'
    },
    tagline: {
      marginTop: 4,
      maxWidth: 280,
      color: palette.text.secondary
    },
    columnHeading: {
      fontWeight: 700,
      fontSize: 12,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: palette.text.secondary,
      marginBottom: 6
    },
    link: {
      display: 'block',
      color: palette.text.primary,
      fontSize: 14,
      marginBottom: 6,
      cursor: 'pointer',
      '&:hover': {
        color: palette.primary.main
      }
    },
    bottomBar: {
      marginTop: 8,
      paddingTop: 6,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8
    },
    bottomText: {
      color: palette.text.secondary,
      fontSize: 13
    },
    bottomLink: {
      color: palette.text.secondary,
      fontSize: 13,
      '&:hover': {
        color: palette.primary.main
      }
    }
  })
);

const navLinks = [
  { id: 'Find an App', route: '/Home' },
  { id: 'App Library', route: '/Apps' },
  { id: 'Framework', route: '/FrameworkQuestions' }
];

export default function Footer({ variant = 'normal' }) {
  const classes = useStyles();
  const handleChangeRoute = useHandleChangeRoute();
  const isAdmin = useIsAdmin();

  return (
    <div ref={useFooterHeightSetRef()} className={classes.root}>
      <div className={classes.container}>
        <div className={classes.columns}>
          {variant !== 'small' && (
            <div className={classes.brandColumn}>
              <Logo autoHide={false} showText={true} />
              <Typography variant='body2' className={classes.tagline}>
                An objective, evidence-informed database of mental health apps from the BIDMC Division of Digital Psychiatry.
              </Typography>
            </div>
          )}
          <div className={classes.column}>
            <Typography className={classes.columnHeading}>Explore</Typography>
            {navLinks.map(({ id, route }) => (
              <Link key={id} className={classes.link} underline='none' onClick={handleChangeRoute(route)}>
                {id}
              </Link>
            ))}
            {isAdmin && (
              <Link className={classes.link} underline='none' onClick={handleChangeRoute('/Admin')}>
                Admin
              </Link>
            )}
          </div>
          <div className={classes.column}>
            <Typography className={classes.columnHeading}>Contact</Typography>
            <Link className={classes.link} underline='none' href={`mailto:${pkg.contactEmail}`} target='_blank'>
              {pkg.contactEmail}
            </Link>
            <Link className={classes.link} underline='none' href='https://www.digitalpsych.org/' target='_blank'>
              Division of Digital Psychiatry
            </Link>
            <Link className={classes.link} underline='none' onClick={handleChangeRoute('/Community')}>
              Community
            </Link>
          </div>
        </div>

        <Divider style={{ marginTop: 16 }} />
        <div className={classes.bottomBar}>
          <Typography className={classes.bottomText}>© {new Date().getFullYear()} BIDMC Division of Digital Psychiatry</Typography>
          <Link className={classes.bottomLink} underline='none' href='https://www.argosyfnd.org/' target='_blank'>
            Made possible by support from the Argosy Foundation
          </Link>
        </div>
      </div>
    </div>
  );
}
