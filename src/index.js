import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import 'react-quill/dist/quill.snow.css';
import * as serviceWorker from './serviceWorker';
import { printHeader } from './helpers';

printHeader();

if (process.env.NODE_ENV === 'development') {
  // 'ResizeObserver loop ...' is a benign browser message (an observer
  // callback changed layout in the same frame — common with virtualized
  // lists), but the dev server's error overlay escalates it into a
  // full-screen error. Swallow it in development only; production builds
  // have no overlay.
  const benign = /ResizeObserver loop (limit exceeded|completed with undelivered notifications)/;
  window.addEventListener('error', e => {
    if (benign.test(e.message)) {
      e.stopImmediatePropagation();
      setTimeout(() => document.getElementById('webpack-dev-server-client-overlay')?.remove(), 0);
    }
  });
}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
