import * as React from 'react';
import { tables } from './dbConfig';
import { useTableState, useTableLength } from './useTableState';
import { useApplications } from './useApplications';

const useIndexAppRatings = () => {
  const [ratings] = useRatings();
  const [applications] = useApplications();
  const [index, setIndex] = useTableState(tables.ix_app_ratings);
  const buildIndex = React.useCallback(() => {    
    setIndex(
      Object.keys(applications).reduce((f, c: any) => {
        f[applications[c]._id] = Object.keys(ratings).filter(k => ratings[k].appId === applications[c]._id);
        return f;
      }, {})
    );
  }, [applications, ratings, setIndex]);

  return [index, buildIndex];
};

export const useRatings = () => useTableState(tables.ratings);
const useRatingsLength = () => useTableLength(tables.ratings);
const useApplicationsLength = () => useTableLength(tables.applications);

// This rebuilds the index automatically whenever the number of entries change for ratings or applications
export const useAutoBuildIndex = () => {
  const [, buildIndex] = useIndexAppRatings();
  const ratingsCount = useRatingsLength();
  const applicationsCount = useApplicationsLength();
  React.useEffect(() => {
    buildIndex();
    // eslint-disable-next-line
  }, [ratingsCount, applicationsCount]); // Purposely leave buildIndex out of the dependency array
};
