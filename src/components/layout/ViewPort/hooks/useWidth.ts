import React from 'react';
import { WidthContext } from '../Providers/WidthProvider';

export default function useWidth() {
  const context = React.useContext(WidthContext);
  if (context === undefined) {
    throw new Error('useWidth must be used within a WidthProvider');
  }
  return context;
}
