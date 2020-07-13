import * as Layout from './components/layout/store';
import * as Table from './components/application/GenericTable/store';
import * as Dialog from './components/application/GenericDialog/store';
import * as Selector from './components/application/Selector/store';
import * as SnackBar from './components/application/SnackBar/store';
import * as Database from './database/store';

// The top-level state object
export interface AppState {
  router: any;
  layout: Layout.State;
  dialog: any;
  table: Table.State;
  selector: any;
  snackBar: any;
  database: any;    
}

// Whenever an action is dispatched, Redux will update each top-level application state property using
// the reducer with the matching name. It's important that the names match exactly, and that the reducer
// acts on the corresponding AppState property type.
export const reducers = {
  layout: Layout.reducer,
  dialog: Dialog.reducer,
  table: Table.reducer,
  selector: Selector.reducer,
  snackBar: SnackBar.reducer,
  database: Database.reducer,  
};
