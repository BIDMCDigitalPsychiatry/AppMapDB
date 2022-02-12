import React from 'react';
import { isEmpty } from '../../../../helpers';
import useRefDimensions from './useRefDimensions';
import { HeaderHeightContext } from '../Providers/HeaderHeightProvider';

export const useHeaderHeightSetRef = () => {
  const { setRef, height } = useRefDimensions();
  const { height: h, setHeight } = React.useContext(HeaderHeightContext);
  React.useEffect(() => {
    !isEmpty(height) && height !== h && setHeight(height);
  }, [setHeight, h, height]);
  return setRef;
};
