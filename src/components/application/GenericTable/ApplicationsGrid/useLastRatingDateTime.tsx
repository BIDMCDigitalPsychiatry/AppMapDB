import { getDayFromTimestamp, getDayTimeFromTimestamp } from '../../../../helpers';
import { useIsAdmin } from '../../../../hooks';

export const useLastRatingDateTime = ({ created, updated }) => {
  const isAdmin = useIsAdmin();

  if (isAdmin) {
    return updated ? getDayTimeFromTimestamp(updated) : created ? getDayTimeFromTimestamp(created) : '';
  } else {
    return updated ? getDayFromTimestamp(updated) : created ? getDayFromTimestamp(created) : '';
  }
};
