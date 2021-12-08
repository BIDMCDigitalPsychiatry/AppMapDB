import * as React from 'react';
import { makeStyles, createStyles, useScrollTrigger } from '@material-ui/core';
import SnackBar from '../application/SnackBar/SnackBar';
import { useAppBarHeight, useFooterHeight, useHeight, useLeftDrawer } from './store';
import ApplicationBarV2 from './ApplicationBarV2';
import FooterV2 from './FooterV2';
import { useLocation } from 'react-router';
import LeftDrawer from './LeftDrawer';
import KeyWords from './KeyWords';
import { useUrlParameter } from '../../hooks';
import { useChangeRoute } from './hooks';
import { isEmpty, publicUrl } from '../../helpers';

const useStyles = makeStyles(({ breakpoints, palette, layout }: any) =>
  createStyles({
    root: {
      display: 'static'
    },
    content: ({ leftDrawerOpen, overflow = 'auto' }) => ({
      flexGrow: 1,
      overflow,
      overflowX: 'hidden',
      height: '100vh',
      backgroundColor: palette.common.white,
      marginLeft: leftDrawerOpen ? layout.leftDrawerWidth : 0,
      [breakpoints.down('sm')]: {
        marginLeft: 0,
        flexShrink: 0
      }
    }),
    innerContent: ({ fullHeight, minHeight, contentHeight }) => ({
      minHeight: minHeight,
      height: fullHeight ? undefined : contentHeight,
      overflow: 'hidden'
    }),
    toolbar: ({ appBarHeight }: any) => ({
      background: palette.white,
      height: appBarHeight
    })
  })
);

const smallRoutes = ['/Apps', 'Admin', '/MyRatings'];
const noScrollPaths = ['/Apps', '/Admin', '/MyRatings'];
const noFooterPaths = ['/Apps', '/Admin', '/MyRatings'];
export const noPadPaths = ['/Home', '/', '/Apps'];

export default function LayoutV2({ children }) {
  const [leftDrawerOpen] = useLeftDrawer();
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
    leftDrawerOpen,
    fullHeight: true,
    overflow: noScrollPaths.find(p => p === pathname) ? 'hidden' : 'auto',
    contentHeight,
    appBarHeight,
    footerHeight,
    minHeight
  });

  const trigger = useScrollTrigger({ target: ref.current });

  const surveyId = useUrlParameter('surveyId');
  const appId = useUrlParameter('appId');

  const changeRoute = useChangeRoute();

  React.useEffect(() => {
    if (!isEmpty(surveyId) && !isEmpty(appId)) {
      changeRoute(publicUrl('/SurveyFollowUp'), { surveyId, appId });
    }
  }, [changeRoute, surveyId, appId]);

  return (
    <div data-testid='app-container' className={classes.root}>
      <main id='app-content' ref={ref} className={classes.content}>
        <ApplicationBarV2 trigger={trigger} />
        <LeftDrawer />
        <div className={classes.toolbar} />
        <div className={classes.innerContent}>{children}</div>
        {!noFooterPaths.find(p => p === pathname) && <FooterV2 variant={variant} />}
        <SnackBar />
        <KeyWords />
      </main>
    </div>
  );
}
