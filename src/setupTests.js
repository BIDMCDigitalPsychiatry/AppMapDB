// jest-dom adds custom matchers for asserting on DOM nodes (vitest flavor).
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';

// The AWS SDK v3 clients require TextEncoder/TextDecoder at import time;
// guard for any environment that doesn't provide them globally.
import { TextEncoder, TextDecoder } from 'util';
if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder;
if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder;

// jsdom offers localforage no usable storage driver (no IndexedDB/WebSQL),
// which surfaces as unhandled rejections when the redux-persist store boots.
// The app only uses it as a persistence engine — an in-memory stand-in is fine.
vi.mock('localforage', () => {
  const store = new Map();
  const engine = {
    INDEXEDDB: 'asyncStorage',
    WEBSQL: 'webSQLStorage',
    LOCALSTORAGE: 'localStorageWrapper',
    config: () => true,
    setDriver: () => Promise.resolve(),
    getItem: key => Promise.resolve(store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, value);
      return Promise.resolve(value);
    },
    removeItem: key => {
      store.delete(key);
      return Promise.resolve();
    },
    keys: () => Promise.resolve([...store.keys()]),
    createInstance: () => engine
  };
  return { ...engine, default: engine };
});
