import * as React from 'react';
import { makeStyles, createStyles, useScrollTrigger } from '@material-ui/core';
import SnackBar from '../application/SnackBar/SnackBar';
import { useAppBarHeight, useFooterHeight, useHeight } from './store';
import ApplicationBarV2 from './ApplicationBarV2';
import FooterV2 from './FooterV2';
import { useLocation } from 'react-router';

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
    /*innerContent: ({ minHeight }) => ({
      minHeight: minHeight - 16,
      paddingTop: 8,
      paddingBottom: 8
    }),
    */
    innerContent: ({ fullHeight, minHeight, overflow = 'hidden', contentHeight, padInnerContent = true }) => ({
      minHeight: minHeight - (padInnerContent ? 16 : 0),
      height: fullHeight ? undefined : contentHeight - (!padInnerContent ? 0 : layout.contentpadding * 2 + 1),
      overflow,
      paddingTop: padInnerContent ? 8 : 0,
      paddingBottom: padInnerContent ? 8 : 0
    }),
    toolbar: ({ appBarHeight }: any) => ({
      background: palette.white,
      height: appBarHeight
    })
  })
);

const smallRoutes = ['/Apps'];
//const noScrollPaths = ['/Apps'];
//const fullHeightPaths = ['/', '/Home', '/FrameworkQuestions', '/News', '/RateAnApp'];
export const noPadPaths = [
  /*'/Home', '/', '/Apps'*/
];

export default function LayoutV2({ children }) {
  const height = useHeight();
  const appBarHeight = useAppBarHeight();
  const footerHeight = useFooterHeight();
  const componentsOnPage = [appBarHeight, footerHeight];
  const minHeight = height - appBarHeight - footerHeight - 1;
  var contentHeight = height - componentsOnPage.reduce((t, c) => t + c, 0);

  let ref = React.useRef();

  const { pathname } = useLocation();
  const variant = smallRoutes.find(p => p === pathname) ? 'small' : 'normal';

  const classes = useStyles({
    fullHeight: true, //fullHeightPaths.find(p => p === pathname) ? true : false,
    padInnerContent: noPadPaths.find(p => p === pathname) ? false : true,
    //overflow: noScrollPaths.find(p => p === pathname) ? 'hidden' : 'auto',
    contentHeight,
    appBarHeight,
    footerHeight,
    minHeight
  });

  const trigger = useScrollTrigger({ target: ref.current });

  return (
    <div data-testid='app-container' className={classes.root}>
      <main ref={ref} className={classes.content}>
        <ApplicationBarV2 trigger={trigger} />
        <div className={classes.toolbar} />
        <div className={classes.innerContent}>{children}</div>
        <FooterV2 variant={variant} />
        <SnackBar />
      </main>
    </div>
  );
}
