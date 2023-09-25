import * as React from 'react';
import { Reducer } from 'redux';
import { AppState } from '../../store';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { theme } from '../../constants';
import { useFullScreen, useIsAdmin } from '../../hooks';
import { useLocation } from 'react-router';
import { useTheme } from '@mui/material';
import pkg from '../../../package.json';

export type ViewMode = 'table' | 'grid';

export interface State {
  appBarHeight?: number;
  footerHeight?: number;
  viewMode?: ViewMode;
  adminMode?: boolean;
  routeState: any;
  step?: number | null;
  tourCompleted?: boolean;
  version: 'lite' | 'full';
}

const defaultState = {
  appBarHeight: (theme as any).layout.toolbarheight,
  footerHeight: (theme as any).layout.footerHeight,
  viewMode: 'grid',
  adminMode: false,
  routeState: {},
  leftDrawerOpen: false,
  step: 0,
  tourCompleted: false,
  version: 'full'
};

const setUser = user => ({ type: 'SET_USER', user });
const changeViewMode = (mode: ViewMode) => ({ type: 'CHANGE_VIEW_MODE', mode });
const changeAdminMode = (adminMode: boolean) => ({ type: 'CHANGE_ADMIN_MODE', adminMode });

export const reducer: Reducer<State> = (state: State | any, action) => {
  switch (action.type) {
    case 'STEP':
      return {
        ...state,
        step: action.step
      };
    case 'TOUR_COMPLETED':
      return {
        ...state,
        tourCompleted: action.completed
      };

    case 'ROUTE_STATE':
      return {
        ...state,
        routeState: action.state
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.user
      };
    case 'RESIZE':
      return {
        ...state,
        [action.key]: action.height
      };
    case 'UPDATE_LAYOUT':
      return {
        ...state,
        ...action.payload
      };
    case 'CHANGE_VIEW_MODE':
      return {
        ...state,
        viewMode: action.mode
      };
    case 'CHANGE_ADMIN_MODE':
      return {
        ...state,
        adminMode: action.adminMode
      };
    case 'CHANGE_LAYOUT_MODE':
      return {
        ...state,
        layoutMode: action.layoutMode
      };
    default:
  }
  return state || { ...defaultState };
};

export const useSetUser = () => {
  const dispatch = useDispatch();
  return React.useCallback(user => dispatch(setUser(user)), [dispatch]);
};

export const useRouteState = () => {
  const dispatch = useDispatch();
  const setState = React.useCallback(state => dispatch({ type: 'ROUTE_STATE', state }), [dispatch]);
  const state = useSelector((state: AppState) => state.layout.routeState);
  return [state, setState];
};

export const useViewMode = () => {
  const dispatch = useDispatch();
  const setViewMode = React.useCallback(mode => dispatch(changeViewMode(mode)), [dispatch]);
  const viewMode = useSelector((state: AppState) => state.layout.viewMode);
  return [viewMode, setViewMode];
};

export const useAdminMode = () => {
  const dispatch = useDispatch();
  const isAdmin = useIsAdmin();
  const setAdminMode = React.useCallback(adminMode => dispatch(changeAdminMode(adminMode)), [dispatch]);
  const adminMode = useSelector((state: AppState) => state.layout.adminMode);
  return [isAdmin && adminMode, setAdminMode];
};

export const useLayout = (): any[] => {
  const dispatch = useDispatch();
  const layout = useSelector((state: AppState) => state.layout, shallowEqual);
  const setLayout = React.useCallback(
    payload => {
      dispatch({ type: 'UPDATE_LAYOUT', payload });
    },
    [dispatch]
  );
  return [layout, setLayout];
};

export const useLeftDrawer = (): any[] => {
  const { pathname } = useLocation();
  const [{ leftDrawerOpen = false }, setLayout] = useLayout();
  const { layout }: any = useTheme();
  const fullScreen = useFullScreen();
  const { drawerPaths } = layout;
  const parts = (pkg.homepage ?? '').split('/');
  const lastPart = (parts.length > 0 ? parts[parts.length - 1] : '').replace('/', '');
  const leftDrawerEnabled = drawerPaths.find(p => p === pathname || `/${lastPart}/${p}` === pathname) ? true : false;
  const setLeftDrawerOpen = React.useCallback((open = !leftDrawerOpen) => setLayout({ leftDrawerOpen: open }), [setLayout, leftDrawerOpen]);
  return [leftDrawerEnabled && (fullScreen ? leftDrawerOpen : true), setLeftDrawerOpen, leftDrawerEnabled];
};
