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

const useStyles = makeStyles(({ breakpoints, palette, appBarHeight }: any) =>
  createStyles({
    root: {
      display: 'static'
    },
    content: ({ overflow = 'auto' }) => ({
      flexGrow: 1,
      overflow,
      overflowX: 'hidden',
      height: '100vh',
      backgroundColor: palette.common.white,
      marginLeft: 0,
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

  const classes = useStyles({
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
