import React from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import configureStore from './storeConfig';
import { createBrowserHistory } from 'history';
import { AppState } from './store';
import { persistStore } from 'redux-persist';
import ViewPort from './components/layout/ViewPort';
import AppRouter from './components/layout/AppRouter';
import { theme } from './constants';
import { asyncSeed } from './database/seed';
import { ReactReduxFirebaseProvider } from 'react-redux-firebase';
import firebase from 'firebase/app';
import 'firebase/auth';

export const history = createBrowserHistory(); // Create browser history to use in the Redux store'
export const initialState = (window as any).initialReduxState as AppState; // Get the application-wide store instance, prepopulating with state from the server where available.
export const store = configureStore(history, initialState) as any; //Setup the global store object
export const getState = store.getState;
export const persistor = persistStore(store); //Setup the global persistor
(window as any).seed = (count, force) => asyncSeed(count, force);

// react-redux-firebase config
const rrfProps = {
  firebase,
  config: {},
  dispatch: store.dispatch
};

function AppWrapper(props: any) {
  const { children } = props;
  return (
    <Provider store={store}>
      <ReactReduxFirebaseProvider {...rrfProps}>
        <PersistGate loading={null} persistor={persistor}>
          <MuiThemeProvider theme={theme}>
            <ViewPort>{children}</ViewPort>
          </MuiThemeProvider>
        </PersistGate>
      </ReactReduxFirebaseProvider>
    </Provider>
  );
}

function App() {
  return (
    <AppWrapper>
      <React.Suspense fallback={<></>}>
        <AppRouter history={history} />
      </React.Suspense>
    </AppWrapper>
  );
}

export default App;
