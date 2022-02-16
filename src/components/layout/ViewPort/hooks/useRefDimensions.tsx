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
      if (elements && elements.length > 0) {
        const { height, width } = getDimensions(elements[0]); // Try newest method for height and width first
        if (height !== undefined && width !== undefined) {
          setState({ height, width });
        } else {
          // Default to legacy method (Probably a Safari browser)
          const { height, width } = (elements[0].target ?? ref).getBoundingClientRect();
          setState({ height, width });
        }
      } else if (ref) {
        const { height, width } = ref.getBoundingClientRect();
        setState({ height, width });
      }
    },
    [setState, ref]
  );
  useResizeObserver(ref, callback, true);
  return { ref, setRef, height, width };
};

export default useRefDimensions;
