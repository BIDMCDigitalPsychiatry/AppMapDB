import { useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import HeightProvider from './Providers/HeightProvider';
import WidthProvider from './Providers/WidthProvider';
import useRefDimensions from './hooks/useRefDimensions';
import AppBarHeightProvider from './Providers/AppBarHeightProvider';
import HeaderHeightProvider from './Providers/HeaderHeightProvider';

const useStyles = makeStyles(() =>
  createStyles({
    dimensions: {
      overflow: 'hidden' as 'hidden',
      position: 'fixed' as 'fixed',
      width: 'calc(100vw)',
      height: 'calc(100vh)'
    },
    static: {
      flexGrow: 1,
      zIndex: 1,
      overflow: 'hidden' as 'hidden',
      position: 'fixed' as 'fixed',
      display: 'static' as 'static',
      width: '100%'
    }
  })
);

const ViewPort = ({ children }) => {
  const classes = useStyles({});
  const { layout } = useTheme() as any;
  const { height, width, setRef } = useRefDimensions();
  return (
    <>
      <div ref={setRef} className={classes.dimensions} />
      <div id='viewport' className={classes.static} style={{ height, width, backgroundColor: layout.backgroundColor }}>
        <HeightProvider value={height}>
          <WidthProvider value={width}>
            <AppBarHeightProvider>
              <HeaderHeightProvider>{children}</HeaderHeightProvider>
            </AppBarHeightProvider>
          </WidthProvider>
        </HeightProvider>
      </div>
    </>
  );
};

export default ViewPort;
