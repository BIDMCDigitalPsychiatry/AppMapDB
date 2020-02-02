import * as React from 'react';
import * as Tables from '../application/GenericTable';
import { useViewMode } from '../layout/LayoutStore';

export default function Apps() {
  const [viewMode] = useViewMode() as any;
  return viewMode === 'table' ? <Tables.Applications /> : <Tables.ApplicationsList />;
}
