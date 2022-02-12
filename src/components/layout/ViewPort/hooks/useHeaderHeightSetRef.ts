import React from 'react';
import { isEmpty } from '../../../../helpers';
import useRefDimensions from './useRefDimensions';
import { HeaderHeightContext } from '../Providers/HeightHeightProvider';
import useHeaderHeight from './useHeaderHeight';

export const useHeaderHeightSetRef = () => {
  const { setRef, height } = useRefDimensions();
  const { setHeight } = React.useContext(HeaderHeightContext);
  const hh = useHeaderHeight();
  React.useEffect(() => {
    !isEmpty(height) && height !== hh && setHeight(height);
  }, [setHeight, hh, height]);
  console.log('here');
  return setRef;
};
