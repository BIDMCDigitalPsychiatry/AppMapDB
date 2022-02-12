import React from 'react';

export const AppBarHeightContext = React.createContext({ height: 0, setHeight: height => null });

function AppBarHeightProvider({ children }) {
  const [height, setHeight] = React.useState(0);
  return <AppBarHeightContext.Provider value={{ height, setHeight }}>{children}</AppBarHeightContext.Provider>;
}

export default AppBarHeightProvider;
