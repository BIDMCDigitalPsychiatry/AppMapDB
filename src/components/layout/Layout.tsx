import * as React from 'react';
import { makeStyles, createStyles } from '@material-ui/core';
import ApplicationBar from './ApplicationBar';
import Footer from './Footer';
import SnackBar from '../application/SnackBar/SnackBar';

const useStyles = makeStyles(({ breakpoints, palette, mixins, layout }: any) =>
  createStyles({
    root: {
      display: 'static'
    },
    content: {
      flexGrow: 1,
      backgroundColor: palette.background.default,
      [breakpoints.down('sm')]: {
        marginLeft: 0,
        flexShrink: 0
      }
    },
    innerContent: {
      padding: layout.contentpadding
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

export default function Layout({ children }) {
  const classes = useStyles({});
  return (
    <div data-testid='app-container' className={classes.root}>
      <main className={classes.content}>
        <ApplicationBar />
        <div className={classes.toolbar} />
        <div className={classes.innerContent}>{children}</div>
        <Footer />
        <SnackBar />
      </main>
    </div>
  );
}
