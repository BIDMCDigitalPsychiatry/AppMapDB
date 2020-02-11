import * as React from 'react';
import * as LayoutStore from './store';
import ContainerDimensions from 'react-container-dimensions';
import { makeStyles, createStyles, useTheme } from '@material-ui/core';

interface ViewPortDimensionsProps {
  containerHeight?: number | undefined;
  containerWidth?: number | undefined;
  resizeViewPort?: (height: number | undefined, width: number | undefined) => void;
}

const ViewPortDimensions = (props: ViewPortDimensionsProps) => {
  const { containerHeight, containerWidth, resizeViewPort } = props;
  React.useEffect(() => {
    resizeViewPort(containerHeight, containerWidth);
  }, [containerHeight, containerWidth, resizeViewPort]);

  return <></>;
};

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
  const [height, width] = LayoutStore.useDimensions();
  const resizeViewPort = LayoutStore.useResizeViewPort();
  const { layout } = useTheme();
  return (
    <>
      <div className={classes.dimensions}>
        <ContainerDimensions>
          {({ height, width }: any) => <ViewPortDimensions containerHeight={height} containerWidth={width} resizeViewPort={resizeViewPort} />}
        </ContainerDimensions>
      </div>

      <div id='viewport' className={classes.static} style={{ height, width, backgroundColor: layout.backgroundColor }}>
        {children}
      </div>
    </>
  );
};

export default ViewPort;
