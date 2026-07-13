import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

it('renders without crashing', async () => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  ReactDOM.render(<App />, div);
  // Let pending async work (store rehydration, initial data fetch kickoff)
  // settle, then unmount so nothing runs after the test environment is gone.
  await new Promise(resolve => setTimeout(resolve, 250));
  ReactDOM.unmountComponentAtNode(div);
  div.remove();
});
