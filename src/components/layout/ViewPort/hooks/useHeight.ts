import React from 'react';
import { HeightContext } from '../Providers/HeightProvider';

export default function useHeight() {
  const context = React.useContext(HeightContext);
  if (context === undefined) {
    throw new Error('useHeight must be used within a HeightProvider');
  }
  return context;
}
