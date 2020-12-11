import * as React from 'react';
import { Reducer } from 'redux';
import { AppState } from '../../store';
import { useDispatch, useSelector } from 'react-redux';
import { theme } from '../../constants';
import { useIsAdmin } from '../../hooks';

export type ViewMode = 'table' | 'list';

export interface State {
  height?: number;
  width?: number;
  appBarHeight?: number;
  layoutMode?: string;
  viewMode?: ViewMode;
  adminMode?: boolean;
}

const defaultState = {
  width: 0,
  height: 0,
  appBarHeight: (theme as any).layout.toolbarheight,
  viewMode: 'table',
  layoutMode: 'v1',
  adminMode: false
};

const setUser = user => ({ type: 'SET_USER', user });
const resizeViewPort = (height: number | undefined, width: number | undefined) => ({ type: 'RESIZE_VIEWPORT', height: height, width: width });
const resizeAppBar = (height: number | undefined) => ({ type: 'RESIZE_APPBAR', height });
const changeViewMode = (mode: ViewMode) => ({ type: 'CHANGE_VIEW_MODE', mode });
const changeAdminMode = (adminMode: boolean) => ({ type: 'CHANGE_ADMIN_MODE', adminMode });
const changeLayoutMode = (layoutMode: string) => ({ type: 'CHANGE_LAYOUT_MODE', layoutMode });

export const reducer: Reducer<State> = (state: State | any, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.user
      };
    case 'RESIZE_APPBAR':
      return {
        ...state,
        appBarHeight: action.height
      };
    case 'RESIZE_VIEWPORT':
      return {
        ...state,
        height: action.height,
        width: action.width
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

export const useResizeAppBar = () => {
  const dispatch = useDispatch();
  return React.useCallback(height => dispatch(resizeAppBar(height)), [dispatch]);
};

export const useAppBarHeight = (): number => {
  return useSelector((state: AppState) => state.layout.appBarHeight);
};

export const useResizeViewPort = () => {
  const dispatch = useDispatch();
  return React.useCallback((height, width) => dispatch(resizeViewPort(height, width)), [dispatch]);
};

export const useHeight = (): number => {
  return useSelector((state: AppState) => state.layout.height);
};

export const useWidth = (): number => {
  return useSelector((state: AppState) => state.layout.width);
};

export const useDimensions = () => {
  return [useHeight(), useWidth()];
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

export const useLayoutMode = () => {
  const dispatch = useDispatch();
  const setLayoutMode = React.useCallback((layoutMode: string) => dispatch(changeLayoutMode(layoutMode)), [dispatch]);
  const layoutMode = useSelector((state: AppState) => state.layout.layoutMode);
  return [layoutMode, setLayoutMode];
};
