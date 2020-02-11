export interface SnackBarState {
  open?: boolean;
  variant?: 'success' | 'error' | 'warning' | 'info';
  message?: string;
}
const initialState = {};

export const updateSnackBar = (payload: SnackBarState) => ({ type: 'SNACKBAR', payload });

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SNACKBAR':
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
};
