import * as React from 'react';
import { makeStyles, createStyles, useTheme } from '@material-ui/core';
import ApplicationBar from './ApplicationBar';
import Footer from './Footer';
import SnackBar from '../application/SnackBar/SnackBar';
import { useAppBarHeight, useHeight } from './store';
import { useLocation } from 'react-router';

const useStyles = makeStyles(({ breakpoints, palette, layout }: any) =>
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
    innerContent: ({ overflow = 'auto', contentHeight, padInnerContent = true }) => ({
      height: contentHeight - (!padInnerContent ? 0 : layout.contentpadding * 2 + 1),
      overflow,
      padding: padInnerContent ? layout.contentpadding : 0
    }),
    toolbar: ({ appBarHeight }: any) => ({
      background: palette.white,
      height: appBarHeight
    })
  })
);

const noScrollPaths = ['/Apps', '/', '/RateNewApp'];
export const noPadPaths = ['/Home', '/', '/Apps'];

export default function Layout({ children }) {
  const height = useHeight();
  const appBarHeight = useAppBarHeight();

  const { layout } = useTheme() as any;
  const componentsOnPage = [appBarHeight, layout.footerheight];
  var contentHeight = height - componentsOnPage.reduce((t, c) => t + c, 0);

  const { pathname } = useLocation();
  const classes = useStyles({
    padInnerContent: noPadPaths.findIndex(p => p === pathname) > -1 ? false : true,
    overflow: noScrollPaths.findIndex(p => p === pathname) > -1 ? 'hidden' : 'auto',
    contentHeight,
    appBarHeight
  });

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
