export interface SnackBarState {
  open?: boolean;
  variant?: 'success' | 'error' | 'warning' | 'info';
  message?: string;
}
const initialState = {};

const snackBarReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SNACKBAR':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default snackBarReducer;
