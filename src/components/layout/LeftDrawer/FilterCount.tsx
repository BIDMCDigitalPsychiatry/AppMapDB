import { useFilterCount } from '../useFilterCount';
import StyledBadge from '../StyledBadge';

export default function FilterCount() {
  return <StyledBadge badgeContent={useFilterCount('Applications')} color='primary' />;
}
