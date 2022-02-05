import React from 'react';

export const HeightContext = React.createContext(400);

function HeightProvider({ value = 400, children }) {
  return <HeightContext.Provider value={value}>{children}</HeightContext.Provider>;
}

export default HeightProvider;
