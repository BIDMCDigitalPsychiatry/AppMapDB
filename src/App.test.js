import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import App from './App';

it('renders without crashing', async () => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const root = createRoot(div);
  await act(async () => {
    root.render(<App />);
    // Let pending async work (store rehydration, initial data fetch kickoff)
    // settle, then unmount so nothing runs after the test environment is gone.
    await new Promise(resolve => setTimeout(resolve, 250));
  });
  act(() => root.unmount());
  div.remove();
});
