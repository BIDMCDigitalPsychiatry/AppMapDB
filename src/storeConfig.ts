import thunk from 'redux-thunk';
import { History } from 'history';
import * as StoreModule from './store';
import { AppState, reducers } from './store';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createStore, applyMiddleware, compose, combineReducers, StoreEnhancer, Store } from 'redux';
import { persistReducer } from 'redux-persist';
import * as localforage from 'localforage';
import packageJson from '../package.json';
import firebase from 'firebase/app';
import 'firebase/auth';

localforage &&
  localforage.config &&
  localforage.config({
    driver: localforage.INDEXEDDB, // Force WebSQL; same as using setDriver()
    name: `${packageJson.name}-local-storage`,
    version: 1.0,
    size: 4980736, // Size of database, in bytes. WebSQL-only for now.
    storeName: 'keyvaluepairs', // Should be alphanumeric, with underscores.
    description: `${packageJson.name} application database`
  });

export const persistConfig = {
  key: 'app',
  storage: localforage
};

const fbConfig = {
  apiKey: 'AIzaSyDjeNlKjmQxx0ELp8tXjlgpxRloXsAdyJU',
  projectId: 'app-map-db'
};

export default function configureStore(history: History, initialState?: AppState, appConfig?: any) {
  // Build middleware. These are functions that can process the actions before they reach the store.
  const windowIfDefined = typeof window === 'undefined' ? null : (window as any);
  // If devTools is installed, connect to it
  const devToolsExtension = process.env.NODE_ENV === 'development' && windowIfDefined && (windowIfDefined.__REDUX_DEVTOOLS_EXTENSION__ as () => StoreEnhancer);

  const allReducers = buildRootReducer(reducers, history);
  const persistedReducer = persistReducer(persistConfig, allReducers as any);

  const createStoreWithMiddleware = compose(
    applyMiddleware(thunk, routerMiddleware(history)),
    devToolsExtension ? devToolsExtension() : (f: any) => f
  )(createStore) as any;

  // Combine all reducers and instantiate the app-wide store instance
  const store = createStoreWithMiddleware(persistedReducer, initialState) as Store<AppState>;
  firebase.initializeApp(fbConfig);

  // Enable Webpack hot module replacement for reducers
  if (module.hot) {
    module.hot.accept('./store', () => {
      const nextRootReducer = require<typeof StoreModule>('./store');
      store.replaceReducer(buildRootReducer(nextRootReducer.reducers, history));
    });
  }

  return store;
}

function buildRootReducer(allReducers: any, history: any) {
  return combineReducers<AppState>(Object.assign({}, allReducers, { router: connectRouter(history) }));
}
