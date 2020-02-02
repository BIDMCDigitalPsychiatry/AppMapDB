import * as Layout from './components/layout/LayoutStore';
import * as Table from './components/application/GenericTable/TableStore';
import dialogReducer from './components/application/GenericDialog/reducers';
import * as Popover from './components/application/Popover/PopoverStore';
import * as Selector from './components/application/Selector/SelectorStore';
import snackBarReducer from './components/application/SnackBar/reducers';

// The top-level state object
export interface AppState {
  router: any;
  layout: Layout.State;
  dialog: any;
  table: Table.State;
  selector: any;
  popover: Popover.State;
  snackBar: any;
}

// Whenever an action is dispatched, Redux will update each top-level application state property using
// the reducer with the matching name. It's important that the names match exactly, and that the reducer
// acts on the corresponding AppState property type.
export const reducers = {
  layout: Layout.reducer,
  dialog: dialogReducer,
  popover: Popover.reducer,
  table: Table.reducer,
  selector: Selector.reducer,
  snackBar: snackBarReducer,
};

// This type can be used as a hint on action creators so that its 'dispatch' and 'getState' params are
// correctly typed to match your store.
export interface AppThunkAction<TAction> {
  (dispatch: (action: TAction) => void, getState: () => AppState): void;
}
