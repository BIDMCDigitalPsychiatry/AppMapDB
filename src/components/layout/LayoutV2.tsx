import * as React from 'react';
import { makeStyles, createStyles, useScrollTrigger } from '@material-ui/core';
import SnackBar from '../application/SnackBar/SnackBar';
import { useAppBarHeight, useFooterHeight, useHeight } from './store';
import ApplicationBarV2 from './ApplicationBarV2';
import FooterV2 from './FooterV2';

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
    innerContent: ({ minHeight }) => ({
      minHeight: minHeight - 16,
      paddingTop: 8,
      paddingBottom: 8
    }),
    toolbar: ({ appBarHeight }: any) => ({
      background: palette.white,
      height: appBarHeight
    })
  })
);

export default function LayoutV2({ children }) {
  const height = useHeight();
  const appBarHeight = useAppBarHeight();
  const componentsOnPage = [appBarHeight];
  var contentHeight = height - componentsOnPage.reduce((t, c) => t + c, 0);
  let ref = React.useRef();

  const footerHeight = useFooterHeight();
  const minHeight = height - appBarHeight - footerHeight - 1;

  const classes = useStyles({
    contentHeight,
    appBarHeight,
    minHeight
  });

  const trigger = useScrollTrigger({ target: ref.current });

  return (
    <div data-testid='app-container' className={classes.root}>
      <main ref={ref} className={classes.content}>
        <ApplicationBarV2 trigger={trigger} />
        <div className={classes.toolbar} />
        <div className={classes.innerContent}>{children}</div>
        <FooterV2 />
        <SnackBar />
      </main>
    </div>
  );
}
