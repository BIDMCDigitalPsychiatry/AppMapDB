import * as React from 'react';
import { makeStyles, createStyles, useScrollTrigger } from '@material-ui/core';
import SnackBar from '../application/SnackBar/SnackBar';
import { useAppBarHeight, useHeight } from './store';
import { useLocation } from 'react-router';
import ApplicationBarV2 from './ApplicationBarV2';

const useStyles = makeStyles(({ breakpoints, palette, layout }: any) =>
  createStyles({
    root: {
      display: 'static'
    },
    content: {
      flexGrow: 1,
      overflow: 'auto',
      overflowX: 'hidden',
      height: '100vh',
      backgroundColor: palette.common.white,
      [breakpoints.down('sm')]: {
        marginLeft: 0,
        flexShrink: 0
      }
    },
    innerContent: ({ padInnerContent = true }) => ({
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

export default function LayoutV2({ children }) {
  const height = useHeight();
  const appBarHeight = useAppBarHeight();
  const componentsOnPage = [appBarHeight];
  var contentHeight = height - componentsOnPage.reduce((t, c) => t + c, 0);
  let ref = React.useRef();

  const { pathname } = useLocation();
  const classes = useStyles({
    padInnerContent: noPadPaths.findIndex(p => p === pathname) > -1 ? false : true,
    overflow: noScrollPaths.findIndex(p => p === pathname) > -1 ? 'hidden' : 'auto',
    contentHeight,
    appBarHeight
  });

  const trigger = useScrollTrigger({ target: ref.current });

  return (
    <div data-testid='app-container' className={classes.root}>
      <main ref={ref} className={classes.content}>
        <ApplicationBarV2 trigger={trigger} />

        <div className={classes.toolbar} />

        <div className={classes.innerContent}>{children}</div>

        <SnackBar />
      </main>
    </div>
  );
}
