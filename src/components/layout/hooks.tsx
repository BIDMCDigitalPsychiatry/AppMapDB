import * as React from 'react';
import useComponentSize from '@rehooks/component-size';
import { useAppBarHeight, useFooterHeight, useResizeAppBar, useResizeFooter, useRouteState } from './store';
import { useHistory, useLocation } from 'react-router';
import { shallowEqual, useSelector } from 'react-redux';
import { evalFunc, isEmpty } from '../../helpers';

export const useAppBarHeightRef = () => {
  let ref = React.useRef(null);
  const { height } = useComponentSize(ref);
  const resizeAppBar = useResizeAppBar();
  const ah = useAppBarHeight();
  const trigger = !isEmpty(height) && ah !== height;
  React.useEffect(() => {
    trigger && resizeAppBar(height);
  }, [resizeAppBar, trigger, height]);
  return ref;
};

export const useFooterHeightRef = () => {
  let ref = React.useRef(null);
  const { height } = useComponentSize(ref);
  const resizeFooter = useResizeFooter();
  const fh = useFooterHeight();
  const trigger = !isEmpty(height) && fh !== height;
  React.useEffect(() => {
    trigger && resizeFooter(height);
  }, [resizeFooter, trigger, height]);
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
