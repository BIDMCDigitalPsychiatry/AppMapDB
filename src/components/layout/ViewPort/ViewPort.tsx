import { makeStyles, createStyles, useTheme } from '@material-ui/core';
import HeightProvider from './Providers/HeightProvider';
import WidthProvider from './Providers/WidthProvider';
import useRefDimensions from './hooks/useRefDimensions';

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
          <WidthProvider value={width}>{children}</WidthProvider>
        </HeightProvider>
      </div>
    </>
  );
};

export default ViewPort;
