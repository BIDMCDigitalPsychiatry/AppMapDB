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
import { theme, adminTheme } from './constants';
import { asyncSeed } from './database/seed';
import { useAdminMode } from './components/layout/store';
import { useIsAdmin } from './hooks';
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';

export const history = createBrowserHistory(); // Create browser history to use in the Redux store'
export const initialState = (window as any).initialReduxState as AppState; // Get the application-wide store instance, prepopulating with state from the server where available.
export const store = configureStore(history, initialState) as any; //Setup the global store object
export const getState = store.getState;
export const persistor = persistStore(store); //Setup the global persistor
(window as any).seed = (count, force) => asyncSeed(count, force);

Amplify.configure(awsconfig);

function ThemedViewPort(props: any) {
  const { children } = props;
  const isAdmin = useIsAdmin();
  const [adminMode] = useAdminMode();

  return (
    <MuiThemeProvider theme={isAdmin && adminMode ? adminTheme : theme}>
      <ViewPort>{children}</ViewPort>
    </MuiThemeProvider>
  );
}

function AppWrapper(props: any) {
  const { children } = props;
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemedViewPort>{children}</ThemedViewPort>
      </PersistGate>
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
