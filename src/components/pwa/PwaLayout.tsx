import * as React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import { useAppBarHeight, useFooterHeight } from '../layout/hooks';
import ScrollElementProvider from '../layout/ScrollElementProvider';
import useHeight from '../layout/ViewPort/hooks/useHeight';

const useStyles = makeStyles(({ breakpoints, palette }: any) =>
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
    })
  } as any)
);

export function PwaLayout({ children }) {
  const height = useHeight();
  const [appBarHeight] = useAppBarHeight();
  const [footerHeight] = useFooterHeight();
  const componentsOnPage = [appBarHeight, footerHeight];
  const minHeight = height - appBarHeight - footerHeight - 1;
  var contentHeight = height - componentsOnPage.reduce((t, c) => t + c, 0);

  var [scrollElement, setScrollElement] = React.useState(null);

  const classes = useStyles({
    leftDrawerOpen: false,
    fullHeight: true,
    overflow: 'auto',
    contentHeight,
    appBarHeight: 0,
    footerHeight: 0,
    minHeight: height
  });

  return (
    <div data-testid='app-container' className={classes.root}>
      <main id='app-content' ref={setScrollElement} className={classes.content}>
        <ScrollElementProvider value={scrollElement}>
          <div className={classes.innerContent}>{children}</div>
        </ScrollElementProvider>
      </main>
    </div>
  );
}

export default PwaLayout;
