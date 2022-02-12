import React from 'react';
import { isEmpty } from '../../../../helpers';
import useRefDimensions from './useRefDimensions';
import { AppBarHeightContext } from '../Providers/AppBarHeightProvider';

export const useAppBarHeightSetRef = () => {
  const { setRef, height } = useRefDimensions();
  const { height: h, setHeight } = React.useContext(AppBarHeightContext);
  React.useEffect(() => {
    !isEmpty(height) && height !== h && setHeight(height);
  }, [setHeight, h, height]);
  return setRef;
};
