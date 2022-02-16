import * as React from 'react';
import { useRouteState } from './store';
import { useHistory, useLocation } from 'react-router';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { evalFunc, isEmpty } from '../../helpers';
import { AppState } from '../../store';
import useRefDimensions from './ViewPort/hooks/useRefDimensions';

const useLayoutResizeKey = (key): [number, any] => {
  const dispatch = useDispatch();
  return [useSelector((state: AppState) => state.layout[key]), React.useCallback(height => dispatch({ type: 'RESIZE', key, height }), [key, dispatch])];
};

const useLayoutHeightObserverKey = key => {
  const { setRef, height } = useRefDimensions();
  const [h, setHeight] = useLayoutResizeKey(key);
  React.useEffect(() => {
    !isEmpty(height) && height !== h && setHeight(height);
  }, [setHeight, h, height]);
  return setRef;
};

export const useAppBarHeight = () => useLayoutResizeKey('appBarHeight');
export const useFooterHeight = () => useLayoutResizeKey('footerHeight');
export const useHeaderHeight = () => useLayoutResizeKey('headerHeight');
export const useAppBarHeightSetRef = () => useLayoutHeightObserverKey('appBarHeight');
export const useFooterHeightSetRef = () => useLayoutHeightObserverKey('footerHeight');
export const useHeaderHeightSetRef = () => useLayoutHeightObserverKey('headerHeight');

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

export const useTourStep = () => {
  const step = useSelector((state: AppState) => state.layout.step);
  const dispatch = useDispatch();
  const setStep = React.useCallback((step: any) => dispatch({ type: 'STEP', step }), [dispatch]);
  const handleStep = React.useCallback(step => () => setStep(step), [setStep]);
  return { step, setStep, handleStep };
};
