import * as React from 'react';
import { useScrollTrigger } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import SnackBar from '../application/SnackBar/SnackBar';
import { useAssistantPanel, useLeftDrawer } from './store';
import { useAppBarHeight, useFooterHeight, useTourCompleted } from './hooks';
import ApplicationBar from './ApplicationBar';
import Footer from './Footer';
import { useLocation } from 'react-router';
import LeftDrawer from './LeftDrawer/LeftDrawer';
import DevRoleSwitcher from './DevRoleSwitcher';
import KeyWords from './KeyWords';
import { useUrlParameter } from '../../hooks';
import { useChangeRoute } from './hooks';
import { isEmpty, publicUrl } from '../../helpers';
import ScrollElementProvider from './ScrollElementProvider';
import useHeight from './ViewPort/hooks/useHeight';
import IntroInstallPromptDialog, { title } from '../application/GenericDialog/IntroInstallPrompt';
import { useDialogState } from '../application/GenericDialog/useDialogState';

const useStyles = makeStyles(({ breakpoints, palette, layout }: any) =>
  createStyles({
    root: {
      display: 'static'
    },
    // The assistant panel docks like the left drawer: a margin on the
    // scrolling content reserves its width, so the grid (whose columns come
    // from container queries on its own width) reflows instead of being
    // covered. Below 'sm' the panel is a bottom sheet, so no margin.
    content: ({ leftDrawerOpen, assistantOpen, overflow = 'auto' }) => ({
      flexGrow: 1,
      overflow,
      overflowX: 'hidden',
      height: '100vh',
      backgroundColor: palette.common.white,
      marginLeft: leftDrawerOpen ? layout.leftDrawerWidth : 0,
      marginRight: assistantOpen ? layout.assistantPanelWidth : 0,
      transition: 'margin 195ms cubic-bezier(0.4, 0, 0.6, 1)',
      [breakpoints.down('sm')]: {
        marginLeft: 0,
        marginRight: 0,
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

const smallRoutes = ['/Home', '/', '', '/Apps', 'Admin', '/MyRatings'];
const noScrollPaths = ['/Admin', '/MyRatings'];
const noFooterPaths = ['/Home', '/', '', '/Apps', '/Admin', '/MyRatings'];
export const noPadPaths = ['/Home', '/', '', '/Apps'];

export default function Layout({ children }) {
  const [leftDrawerOpen] = useLeftDrawer();
  const [assistantOpen] = useAssistantPanel();
  const height = useHeight();
  const [appBarHeight] = useAppBarHeight();
  const [footerHeight] = useFooterHeight();
  const componentsOnPage = [appBarHeight, footerHeight];
  const minHeight = height - appBarHeight - footerHeight - 1;
  var contentHeight = height - componentsOnPage.reduce((t, c) => t + c, 0);

  var [scrollElement, setScrollElement] = React.useState(null);

  const { pathname } = useLocation();
  const variant = smallRoutes.find(p => p === pathname) ? 'small' : 'normal';

  const classes = useStyles({
    leftDrawerOpen,
    assistantOpen,
    fullHeight: true,
    overflow: noScrollPaths.find(p => p === pathname) ? 'hidden' : 'auto',
    contentHeight,
    appBarHeight,
    footerHeight,
    minHeight
  });

  const trigger = useScrollTrigger({ target: scrollElement ?? undefined });

  const surveyId = useUrlParameter('surveyId');
  const followUpSurveyType = useUrlParameter('followUpSurveyType');
  const appId = useUrlParameter('appId');

  const changeRoute = useChangeRoute();

  React.useEffect(() => {
    if (!isEmpty(surveyId) && !isEmpty(appId)) {
      changeRoute(publicUrl('/SurveyFollowUp'), { surveyId, followUpSurveyType, appId });
    }
  }, [changeRoute, surveyId, followUpSurveyType, appId]);

  const [, setState] = useDialogState(title);
  const { tourCompleted } = useTourCompleted();

  React.useEffect(() => {
    if (!tourCompleted) {
      console.log('Opening intro video dialog');
      setState({ open: true });
    }
  }, [setState, tourCompleted]);

  return (
    <div data-testid='app-container' className={classes.root}>
      <main id='app-content' ref={setScrollElement} className={classes.content}>
        <ScrollElementProvider value={scrollElement}>
          <ApplicationBar trigger={trigger} />
          <LeftDrawer />
          <IntroInstallPromptDialog />
          <div className={classes.toolbar} />
          <div className={classes.innerContent}>{children}</div>
          {!noFooterPaths.find(p => p === pathname) && <Footer variant={variant} />}
          <SnackBar />
          <KeyWords />
          {/* Renders only under REACT_APP_USE_LOCAL_DATA (npm run start:local) */}
          <DevRoleSwitcher />
        </ScrollElementProvider>
      </main>
    </div>
  );
}
