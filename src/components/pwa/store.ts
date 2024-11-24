import * as React from 'react';
import { Reducer } from 'redux';
import { useDispatch } from 'react-redux';

export interface State {
  index?: number;
  backIndex?: number;
  values?: any;
}

const defaultState = { index: -1, backIndex: 0, values: {} };

const handleChange = ({ index, value }) => ({ type: 'HANDLE_CHANGE', index, value });
const handleSearch = ({ searchIndex }) => ({ type: 'HANDLE_SEARCH', searchIndex });
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
        index: action.searchIndex,
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
        ...defaultState,
        index: 0
      };
    default:
  }
  return state || { ...defaultState };
};

export const usePwaActions = () => {
  const dispatch = useDispatch();
  const change = React.useCallback(({ index, value }) => dispatch(handleChange({ index, value })), [dispatch]);
  const search = React.useCallback(({ searchIndex }) => dispatch(handleSearch({ searchIndex })), [dispatch]);
  const next = React.useCallback(() => dispatch(handleNext()), [dispatch]);
  const back = React.useCallback(() => dispatch(handleBack()), [dispatch]);
  const reset = React.useCallback(() => dispatch(handleReset()), [dispatch]);
  return { change, search, next, back, reset };
};
