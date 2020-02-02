import * as React from 'react';
import { Reducer } from 'redux';
import { AppThunkAction, AppState } from '../../store';
import { useDispatch, useSelector } from 'react-redux';
import { theme } from '../../constants';

export type ViewMode = 'table' | 'list';

export interface ClientAppState {
  height?: number;
  width?: number;
  appBarHeight?: number;
  viewMode?: ViewMode;
}

const defaultState = {
  width: 0,
  height: 0,
  appBarHeight: (theme as any).layout.toolbarheight,
  viewMode: 'table'
};

export type State = ClientAppState;

interface IResizeViewPort {
  type: 'RESIZE_VIEWPORT';
  height: number;
  width: number;
}

interface IResizeAppBar {
  type: 'RESIZE_APPBAR';
  height: number;
}

interface IViewMode {
  type: 'VIEW_MODE';
  mode: ViewMode;
}

type KnownAction = IResizeViewPort | IResizeAppBar | IViewMode;

// TODO
export const useProcessDataHandle = () => {
  return React.useCallback((pdis, address?) => () => null, []); // Placeholder for client->server data processing
};

// TODO
export const useProcessData = () => {
  return React.useCallback((pdis, address?) => null, []); // Placeholder for client->server data processing
};

export const useResizeAppBar = () => {
  const dispatch = useDispatch();
  return React.useCallback(height => dispatch(actionCreators.AResizeAppBar(height)), [dispatch]);
};

export const useAppBarHeight = (): number => {
  return useSelector((state: AppState) => state.layout.appBarHeight);
};

export const useResizeViewPort = () => {
  const dispatch = useDispatch();
  return React.useCallback((height, width) => dispatch(actionCreators.AResizeViewPort(height, width)), [dispatch]);
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
  const setViewMode = React.useCallback(mode => dispatch(actionCreators.AViewMode(mode)), [dispatch]);
  const viewMode = useSelector((state: AppState) => state.layout.viewMode);
  return [viewMode, setViewMode];
};

export const actionCreators = {
  AResizeViewPort: (height: number | undefined, width: number | undefined): AppThunkAction<KnownAction> => dispatch => {
    dispatch({ type: 'RESIZE_VIEWPORT', height: height, width: width });
  },
  AResizeAppBar: (height: number | undefined): AppThunkAction<KnownAction> => dispatch => {
    dispatch({ type: 'RESIZE_APPBAR', height });
  },
  AViewMode: (mode: ViewMode): AppThunkAction<KnownAction> => dispatch => {
    dispatch({ type: 'VIEW_MODE', mode });
  }
};

export const reducer: Reducer<State> = (state: State | any, action: KnownAction | any): any => {
  switch (action.type) {
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
    case 'VIEW_MODE':
      return {
        ...state,
        viewMode: action.mode
      };
    default:
  }
  return state || { ...defaultState };
};
