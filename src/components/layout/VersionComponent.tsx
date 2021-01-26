import { useIsAdmin } from '../../hooks';
import { useLayoutMode } from './store';

export default function VersionComponent({ V1, V2 }) {
  const [layoutMode] = useLayoutMode();
  const isAdmin = useIsAdmin();
  if (isAdmin) {
    return layoutMode === 'v2' ? V2 : V1; // Allow the admin users to toggle to previous version
  } else return V2;
}
