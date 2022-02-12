import * as React from 'react';
import useResizeObserver from '../../../../utils/useResizeObserver';

// The borderbox size includes any padding while the content rect only includes the inner content size
const getDimensions = ({ borderBoxSize, contentRect }) => ({
  height: borderBoxSize !== undefined && borderBoxSize.length > 0 ? borderBoxSize[0].blockSize : contentRect.height,
  width: borderBoxSize !== undefined && borderBoxSize.length > 0 ? borderBoxSize[0].inlineSize : contentRect.width
});

const useRefDimensions = () => {
  const [ref, setRef] = React.useState(null);
  const [{ height, width }, setState] = React.useState({ height: undefined, width: undefined });
  const callback = React.useCallback(
    elements => {
      elements && elements.length > 0 && setState(getDimensions(elements[0]));
    },
    [setState]
  );
  useResizeObserver(ref, callback, true);
  return { ref, setRef, height, width };
};

export default useRefDimensions;
