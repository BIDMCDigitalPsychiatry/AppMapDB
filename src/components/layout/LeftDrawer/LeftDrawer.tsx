import * as React from 'react';
import { createStyles } from '../../../styles/jss';
import Drawer from '@mui/material/Drawer';
import { makeStyles } from '../../../styles/jss';
import LeftDrawerContent from './LeftDrawerContent';
import { useFullScreen } from '../../../hooks';
import { useLeftDrawer } from '../store';
import useHeight from '../ViewPort/hooks/useHeight';
import { useAppBarHeight } from '../hooks';
import { useT } from '../../../i18n';

const useStyles = makeStyles(({ breakpoints, layout }: any) =>
  createStyles({
    drawer: {
      [breakpoints.up('sm')]: {
        width: layout.leftDrawerWidth,
        flexShrink: 0
      }
    },
    drawerPaper: ({ height, appBarHeight }: any) => ({
      overflowX: 'hidden',
      marginTop: appBarHeight + 1, // 1 is for the appbar elevation
      width: layout.leftDrawerWidth,
      height: height - appBarHeight,
      [breakpoints.down('sm')]: {
        height: '100%'
      }
    }),
    drawerPaperTemporary: {
      width: layout.leftDrawerWidth
    }
  })
);

const LeftDrawer = () => {
  const height = useHeight();
  const fullScreen = useFullScreen();
  const [appBarHeight] = useAppBarHeight();
  const classes = useStyles({ height, appBarHeight });
  const [leftDrawer, setLeftDrawer] = useLeftDrawer();
  const handleLeftDrawerClose = React.useCallback(() => setLeftDrawer(false), [setLeftDrawer]);
  const t = useT();

  return (
    <nav className={classes.drawer} aria-label={t('navigation drawer')}>
      <Drawer
        variant='temporary'
        open={fullScreen && leftDrawer}
        onClose={handleLeftDrawerClose}
        classes={{
          paper: classes.drawerPaperTemporary
        }}
        ModalProps={{
          keepMounted: true // Better open performance on mobile.
        }}
        PaperProps={{ 'data-study-scroll': 'filters' } as any} // MIND study: scrolling time in the filter menu
      >
        {fullScreen && leftDrawer && <LeftDrawerContent setLeftDrawer={setLeftDrawer} />}
      </Drawer>
      <Drawer
        classes={{
          paper: classes.drawerPaper
        }}
        variant='persistent'
        open={leftDrawer}
        PaperProps={{ 'data-study-scroll': 'filters' } as any}
      >
        <LeftDrawerContent setLeftDrawer={setLeftDrawer} />
      </Drawer>
    </nav>
  );
};

export default LeftDrawer;
