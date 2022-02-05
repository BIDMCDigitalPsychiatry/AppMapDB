import React from 'react';

export const WidthContext = React.createContext(400);

function WidthProvider({ value = 400, children }) {
  return <WidthContext.Provider value={value}>{children}</WidthContext.Provider>;
}

export default WidthProvider;
