import * as React from 'react';
import { Reducer } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import { useScrollElement } from '../layout/ScrollElementProvider';
import useHeight from '../layout/ViewPort/hooks/useHeight';
import { AppState } from '../../store';
import { searchIndex } from './questions';

export interface State {
  index?: number;
  backIndex?: number;
  values?: any;
}

const defaultState = { index: -1, backIndex: 0, values: {} };

const handleChange = ({ index, value }) => ({ type: 'HANDLE_CHANGE', index, value });
const handleSearch = () => ({ type: 'HANDLE_SEARCH' });
const handleNext = () => ({ type: 'HANDLE_NEXT' });
const handleBack = () => ({ type: 'HANDLE_BACK' });
const handleReset = () => ({ type: 'HANDLE_RESET' });

export const reducer: Reducer<State> = (state: State | any, action) => {
  switch (action.type) {
    case 'HANDLE_CHANGE':
      return {
        ...state,
        values: { ...state.values, [action.index]: action.value }
      };
    case 'HANDLE_SEARCH':
      return {
        ...state,
        index: searchIndex,
        backIndex: state.index
      };
    case 'HANDLE_NEXT':
      return {
        ...state,
        index: state.index + 1,
        backIndex: state.index
      };
    case 'HANDLE_BACK':
      return {
        ...state,
        index: state.backIndex,
        backIndex: state.backIndex >= 0 ? state.backIndex - 1 : -1
      };
    case 'HANDLE_RESET':
      return {
        ...defaultState
      };
    default:
  }
  return state || { ...defaultState };
};

export const usePwaActions = () => {
  const dispatch = useDispatch();
  const scrollEl = useScrollElement();
  const height = useHeight();
  const scrollTop = React.useCallback(() => {
    if (scrollEl) {
      scrollEl.scrollTop = 0;
    }
    // eslint-disable-next-line
  }, [scrollEl, height]);
  const change = React.useCallback(
    ({ index, value }) => {
      dispatch(handleChange({ index, value }));
      scrollTop();
    },
    [dispatch, scrollTop]
  );
  const search = React.useCallback(() => {
    dispatch(handleSearch());
    scrollTop();
  }, [dispatch, scrollTop]);
  const next = React.useCallback(() => {
    dispatch(handleNext());
    scrollTop();
  }, [dispatch, scrollTop]);
  const back = React.useCallback(() => {
    dispatch(handleBack());
    scrollTop();
  }, [dispatch, scrollTop]);
  const reset = React.useCallback(() => {
    dispatch(handleReset());
    scrollTop();
  }, [dispatch, scrollTop]);
  return { change, search, next, back, reset };
};

export const useShowResults = () => {
  return useSelector((s: AppState) => (s.pwa.index >= searchIndex ? true : false));
};
