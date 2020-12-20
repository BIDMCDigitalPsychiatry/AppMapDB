import * as React from 'react';
import { useLayoutMode } from './store';
import Layout from './Layout';
import LayoutV2 from './LayoutV2';

export default function LayoutSelector({ children = undefined }) {
  const [layoutMode] = useLayoutMode();
  const LayoutComponent = layoutMode === 'v2' ? LayoutV2 : Layout;
  return <LayoutComponent children={children} />;
}
