import React from 'react';

const ScrollElementContext = React.createContext(null);

function ScrollElementProvider({ value, children }) {
  return <ScrollElementContext.Provider value={value}>{children}</ScrollElementContext.Provider>;
}

export default ScrollElementProvider;

export function useScrollElement() {
  const context = React.useContext(ScrollElementContext);
  if (context === undefined) {
    throw new Error('useWindow must be used within a ScrollElementProvider');
  }
  return context;
}
