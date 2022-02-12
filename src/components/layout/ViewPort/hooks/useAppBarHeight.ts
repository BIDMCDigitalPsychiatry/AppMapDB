import React from 'react';
import { AppBarHeightContext } from '../Providers/AppBarHeightProvider';

export default function useAppBarHeight() {
  const context = React.useContext(AppBarHeightContext);
  if (context === undefined) {
    throw new Error('useHeaderHeight must be used within a HeaderHeightProvider');
  }
  return context?.height;
}
