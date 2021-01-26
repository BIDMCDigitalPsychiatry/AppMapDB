import * as React from 'react';
import { useLayoutMode } from './store';
import Layout from './Layout';
import LayoutV2 from './LayoutV2';
import { useIsAdmin } from '../../hooks';

export default function LayoutSelector({ children = undefined }) {
  const [layoutMode] = useLayoutMode();
  const isAdmin = useIsAdmin();
  const LayoutComponent = layoutMode === 'v2' ? LayoutV2 : Layout;

  if (isAdmin) return <LayoutComponent children={children} />;
  // Only allow the admin to revert to previous version
  else return <LayoutV2 children={children} />; // Default to new version for everyone else
}
