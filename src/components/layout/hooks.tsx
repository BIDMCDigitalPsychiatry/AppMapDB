import * as React from 'react';
import useComponentSize from '@rehooks/component-size';
import { useResizeAppBar, useResizeFooter, useResizeHeader, useRouteState } from './store';
import { useHistory, useLocation } from 'react-router';
import { shallowEqual, useSelector } from 'react-redux';
import { evalFunc } from '../../helpers';

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
      event => {
        changeRoute(route, state);
      },
    [changeRoute]
  );
};

export const useChangeRoute = () => {
  const { pathname } = useLocation();
  const history = useHistory();
  const [statePrev, setState] = useRouteState(); // setState doesn't support a function as a parameter to setState
  return React.useCallback(
    (route: string, state = undefined) => {
      pathname !== route && history && history.push(route);
      if (state) {
        setState(evalFunc(state, statePrev)); // Must manually use previous State instead of (prev) => {...prev} as useRouteState.setState doesn't support functions
      } else {
        setState({});
      }
    },
    // eslint-disable-next-line
    [JSON.stringify(statePrev), history, pathname, setState]
  );
};

export const useUserEmail = () => {
  return useSelector((s: any) => s.layout.user?.signInUserSession?.idToken?.payload?.email);
};

export const useLayoutKey = key => useSelector((state: any) => state.layout[key], shallowEqual);
export const useUser = () => useLayoutKey('user') || {};

export const useUserId = ({ userId = undefined } = {}) => {
  const user = useUser();
  return userId ? userId : user.username;
};
