import { useLayoutMode } from './store';

export default function VersionComponent({ V1, V2 }) {
  const [layoutMode] = useLayoutMode();
  const VC = layoutMode === 'v2' ? V2 : V1;
  return VC;
}
