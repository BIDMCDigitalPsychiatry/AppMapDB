import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
/*
test('renders layout', () => {
  const { getByText } = render(<App />);
  const root = getById('layout-root');
  expect(root).toBeInTheDocument();
});

*/
