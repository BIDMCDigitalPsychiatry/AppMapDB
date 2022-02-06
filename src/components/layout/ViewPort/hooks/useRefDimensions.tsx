import * as React from 'react';
import useResizeObserver from '../../../../utils/useResizeObserver';

const getDimensions = ({ contentRect }) => ({
  height: contentRect.height,
  width: contentRect.width
});

const setDimensions = setState => elements => elements && elements.length > 0 && setState(getDimensions(elements[0]));

const useRefDimensions = () => {
  const [ref, setRef] = React.useState(null);
  const [{ height, width }, setState] = React.useState({ height: undefined, width: undefined });
  useResizeObserver(ref, setDimensions(setState), true);
  return { ref, setRef, height, width };
};

export default useRefDimensions;
