import { updateState } from '../../../helpers';

export const defaultDialogState = {
  open: false,
  type: 'add',
  errors: {},
  showErrors: false,
  submitting: false,
  initialValues: {}
};

const initialState = {
  'Getting Started': { open: true }
};

export const updateDialog = (id, payload) => ({ type: 'UPDATE_DIALOG', id, payload });

export function reducer(state = initialState, action) {
  switch (action.type) {
    case 'UPDATE_DIALOG':
      return updateState(state, action);
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}
