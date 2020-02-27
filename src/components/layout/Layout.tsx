import * as React from 'react';
import { makeStyles, createStyles, useTheme } from '@material-ui/core';
import ApplicationBar from './ApplicationBar';
import Footer from './Footer';
import SnackBar from '../application/SnackBar/SnackBar';
import { useAppBarHeight, useHeight } from './store';

const useStyles = makeStyles(({ breakpoints, palette, mixins, layout }: any) =>
  createStyles({
    root: {
      display: 'static'
    },
    content: {
      flexGrow: 1,
      backgroundColor: palette.common.white,
      [breakpoints.down('sm')]: {
        marginLeft: 0,
        flexShrink: 0
      }
    },
    innerContent: ({ contentHeight }) => ({
      height: contentHeight,
      overflow: 'auto',
      padding: layout.contentpadding
    }),
    toolbar: ({ appBarHeight }: any) => ({
      background: palette.white,
      height: appBarHeight
    })
  })
);

export default function Layout({ children }) {
  const height = useHeight();
  const appBarHeight = useAppBarHeight();

  const { layout } = useTheme();
  const componentsOnPage = [appBarHeight, layout.footerheight];
  var contentHeight = height - componentsOnPage.reduce((t, c) => t + c, 0);
  const classes = useStyles({ contentHeight, appBarHeight });

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
