import * as React from 'react';
import useComponentSize from '@rehooks/component-size';
import { useResizeAppBar, useResizeFooter, useResizeHeader, useRouteState } from './store';
import { useHistory, useLocation } from 'react-router';
import { useSelector } from 'react-redux';

export const useAppBarHeightRef = () => {
  let ref = React.useRef(null);
  const { height } = useComponentSize(ref);
  const resizeAppBar = useResizeAppBar();
  React.useEffect(() => {
    resizeAppBar(height);
  }, [resizeAppBar, height]);
  return ref;
};

export const useHeaderHeightRef = () => {
  let ref = React.useRef(null);
  const { height } = useComponentSize(ref);
  const resizeHeader = useResizeHeader();
  React.useEffect(() => {
    resizeHeader(height);
  }, [resizeHeader, height]);
  return ref;
};

export const useFooterHeightRef = () => {
  let ref = React.useRef(null);
  const { height } = useComponentSize(ref);
  const resizeFooter = useResizeFooter();
  React.useEffect(() => {
    resizeFooter(height);
  }, [resizeFooter, height]);
  return ref;
};

export const useHandleChangeRoute = () => {
  const changeRoute = useChangeRoute();
  return React.useCallback(
    (route, state = undefined) =>
      event =>
        changeRoute(route, state),
    [changeRoute]
  );
};

export const useChangeRoute = () => {
  const { pathname } = useLocation();
  const history = useHistory();
  const [, setState] = useRouteState();
  return React.useCallback(
    (route: string, state = undefined) => {
      pathname !== route && history && history.push(route);      
      setState(state ?? {});
    },
    [history, pathname, setState]
  );
};

export const useUserEmail = () => {  
  return useSelector((s: any) => s.layout.user?.signInUserSession?.idToken?.payload?.email);
}