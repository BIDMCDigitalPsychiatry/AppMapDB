import React from 'react';
import { HeaderHeightContext } from '../Providers/HeightHeightProvider';

export default function useHeaderHeight() {
  const context = React.useContext(HeaderHeightContext);
  if (context === undefined) {
    throw new Error('useHeaderHeight must be used within a HeaderHeightProvider');
  }
  return context?.height;
}
