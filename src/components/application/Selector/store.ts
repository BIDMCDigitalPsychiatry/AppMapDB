import { updateState } from '../../../helpers';

export const defaultState = {};

export const updateSelector = (id, payload) => ({ type: 'UPDATE_SELECTOR', id, payload });

export function reducer(state = defaultState, action) {
  switch (action.type) {
    case 'UPDATE_SELECTOR':
      return updateState(state, action);
    case 'LOGOUT':
      return defaultState;
    default:
      return state;
  }
}
