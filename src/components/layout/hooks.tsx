import * as React from 'react';
import useComponentSize from '@rehooks/component-size';
import { useResizeAppBar } from './store';
import { useHistory, useLocation } from 'react-router';

export const useAppBarHeightRef = () => {
  let ref = React.useRef(null);
  const { height } = useComponentSize(ref);
  const resizeAppBar = useResizeAppBar();
  React.useEffect(() => {
    resizeAppBar(height);
  }, [resizeAppBar, height]);
  return ref;
};

export const useHandleChangeRoute = () => {
  const changeRoute = useChangeRoute();
  return React.useCallback(route => event => changeRoute(route), [changeRoute]);
};

export const useChangeRoute = () => {
  const { pathname } = useLocation();
  const history = useHistory();
  return React.useCallback((route: string) => pathname !== route && history && history.push(route), [history, pathname]);
};
