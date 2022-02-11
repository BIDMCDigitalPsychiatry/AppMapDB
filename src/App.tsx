import React from 'react';
import { ThemeProvider, Theme, StyledEngineProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import configureStore from './storeConfig';
import { createBrowserHistory } from 'history';
import { AppState } from './store';
import { persistStore } from 'redux-persist';
import AppRouter from './components/layout/AppRouter';
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';
import CssBaselineCustom from './components/layout/CssBaselineCustom';
import { isDev, useLayoutTheme } from './helpers';
import LogRocket from 'logrocket';
import pkg from '../package.json';
import ViewPort from './components/layout/ViewPort/ViewPort';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

export const history = createBrowserHistory(); // Create browser history to use in the Redux store'
export const initialState = (window as any).initialReduxState as AppState; // Get the application-wide store instance, prepopulating with state from the server where available.
export const store = configureStore(history, initialState) as any; //Setup the global store object
export const getState = store.getState;
export const persistor = persistStore(store); //Setup the global persistor

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

pkg.enableLogRocket && !isDev() && LogRocket.init('bidmc/mindapp');

Amplify.configure(awsconfig);

function ThemedViewPort(props: any) {
  const { children } = props;
  const layoutTheme = useLayoutTheme();

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={layoutTheme}>
        <CssBaselineCustom />
        <ViewPort>{children}</ViewPort>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

function AppWrapper(props: any) {
  const { children } = props;
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <ThemedViewPort>{children}</ThemedViewPort>
        </LocalizationProvider>
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
