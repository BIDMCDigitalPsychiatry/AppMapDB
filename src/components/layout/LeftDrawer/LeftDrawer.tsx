import * as React from 'react';
import createStyles from '@mui/styles/createStyles';
import Drawer from '@mui/material/Drawer';
import makeStyles from '@mui/styles/makeStyles';
import LeftDrawerContent from './LeftDrawerContent';
import { useFullScreen } from '../../../hooks';
import { useLeftDrawer } from '../store';
import useHeight from '../ViewPort/hooks/useHeight';
import { useAppBarHeight } from '../hooks';

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

  return (
    <nav className={classes.drawer} aria-label='navigation drawer'>
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
      >
        {fullScreen && leftDrawer && <LeftDrawerContent setLeftDrawer={setLeftDrawer} />}
      </Drawer>
      <Drawer
        classes={{
          paper: classes.drawerPaper
        }}
        variant='persistent'
        open={leftDrawer}
      >
        <LeftDrawerContent setLeftDrawer={setLeftDrawer} />
      </Drawer>
    </nav>
  );
};

export default LeftDrawer;
