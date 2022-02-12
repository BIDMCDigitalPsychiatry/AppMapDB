import React from 'react';

export const HeaderHeightContext = React.createContext({ height: 0, setHeight: height => null });

function HeaderHeightProvider({ children }) {
  const [height, setHeight] = React.useState(0);
  return <HeaderHeightContext.Provider value={{ height, setHeight }}>{children}</HeaderHeightContext.Provider>;
}

export default HeaderHeightProvider;


