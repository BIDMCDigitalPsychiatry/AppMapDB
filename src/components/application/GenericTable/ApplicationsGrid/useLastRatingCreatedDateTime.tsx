import { getDayFromTimestamp, getDayTimeFromTimestamp } from '../../../../helpers';
import { useIsAdmin } from '../../../../hooks';

export const useLastRatingCreatedDateTime = ({ created }) => {
  const isAdmin = useIsAdmin();

  if (isAdmin) {
    return created ? getDayTimeFromTimestamp(created) : '';
  } else {
    return created ? getDayFromTimestamp(created) : '';
  }
};
