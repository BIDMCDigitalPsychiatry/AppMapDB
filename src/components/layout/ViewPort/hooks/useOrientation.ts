import useHeight from './useHeight';
import useWidth from './useWidth';

export default function useOrientation() {
  const height = useHeight();
  const width = useWidth();
  return height > width ? 'potrait' : 'landscape';
}
