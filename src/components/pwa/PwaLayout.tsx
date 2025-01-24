import * as React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import { useAppBarHeight } from '../layout/hooks';
import ScrollElementProvider from '../layout/ScrollElementProvider';
import useHeight from '../layout/ViewPort/hooks/useHeight';
import PwaAppBar from './PwaAppBar';
import { useAppTableDataInit } from '../pages/useAppTableData';
import { useSelector } from 'react-redux';
import { AppState } from '../../store';
import { searchIndex } from './questions';
import { useUrlParameter } from '../../hooks';
import { bool } from '../../helpers';

const useStyles = makeStyles(({ breakpoints, palette, appBarHeight }: any) =>
  createStyles({
    root: ({ isInstalled }) => ({
      display: 'static',
      overflow: isInstalled ? 'hidden' : undefined,
      overscrollBehavior: isInstalled ? 'none' : undefined
    }),
    content: ({ overflow = 'auto', isInstalled = false }) => ({
      flexGrow: 1,
      overflow: isInstalled ? 'none' : overflow,
      overflowX: 'hidden',
      overscrollBehavior: isInstalled ? 'none' : undefined,
      height: '100vh',
      backgroundColor: palette.common.white,
      marginLeft: 0,
      [breakpoints.down('sm')]: {
        marginLeft: 0,
        flexShrink: 0
      }
    }),
    innerContent: ({ fullHeight, minHeight, contentHeight, isInstalled }) => ({
      minHeight: minHeight,
      height: fullHeight ? undefined : contentHeight,
      overflow: isInstalled ? 'hidden' : undefined
    }),
    toolbar: ({ appBarHeight }: any) => ({
      background: palette.white,
      height: appBarHeight
    })
  } as any)
);

export function PwaLayout({ children }) {
  const height = useHeight();
  const [appBarHeight] = useAppBarHeight();
  const componentsOnPage = [appBarHeight];
  var contentHeight = height - componentsOnPage.reduce((t, c) => t + c, 0);
  var [scrollElement, setScrollElement] = React.useState(null);

  useAppTableDataInit({ trigger: true });

  const index = useSelector((s: AppState) => s.pwa.index);
  const showLanding = index < 0 ? true : false;

  const installPrompt = useUrlParameter('installPrompt');
  const isInstalled = !bool(installPrompt);

  const classes = useStyles({
    isInstalled,
    leftDrawerOpen: false,
    fullHeight: true,
    overflow: showLanding || index === searchIndex ? 'hidden' : 'auto',
    contentHeight,
    footerHeight: 0,
    appBarHeight,
    minHeight: height - contentHeight
  });

  return (
    <div data-testid='app-container' className={classes.root}>
      <main id='app-content' ref={setScrollElement} className={classes.content}>
        <ScrollElementProvider value={scrollElement}>
          {!showLanding && <PwaAppBar />}
          {!showLanding && <div className={classes.toolbar} />}
          <div className={classes.innerContent}>{children}</div>
        </ScrollElementProvider>
      </main>
    </div>
  );
}

export default PwaLayout;
