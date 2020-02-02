import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../store';

const initialState = {};
const defaultState = {};

const updateSelector = (id, payload) => ({ type: 'UPDATE_SELECTOR', id, payload });

export const useTabSelector = id => {
  const dispatch = useDispatch();
  const state = useSelector((state: AppState) => state.selector[id] || defaultState);
  const setState = React.useCallback(payload => dispatch(updateSelector(id, payload)), [id, dispatch]);
  return [state, setState];
};

// Sets the state based on action.id.  If action.payload is a function, then it is called with the previous props as a parameter
function updateState(state, action) {
  const data = typeof action.payload === 'function' ? action.payload(state[action.id]) : action.payload;
  var newState = { ...state };
  newState[action.id] = data;
  if (state && state[action.id]) {
    newState[action.id] = data;
  }
  return newState;
}

export function reducer(state = initialState, action) {
  switch (action.type) {
    case 'UPDATE_SELECTOR':
      return updateState(state, action);
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}
