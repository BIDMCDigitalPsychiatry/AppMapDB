import React from 'react';
import GenericTableContainer from '../GenericTableContainer';
import { defaultApplicationsListProps } from '../ApplicationsList/table';
import { useAppHistoryData } from '../ApplicationHistory/selectors';
import AppSummary from '../ApplicationsList/AppSummary';
import RatingsColumnHistory from '../Applications/RatingsColumnHistory';
import { useIsAdmin } from '../../../../hooks';

const name = 'App History';

const RatingsButtons = props => {
  const isAdmin = useIsAdmin(); // Only force show the approve check box if the user is an admin
  return <RatingsColumnHistory {...props} isAdmin={isAdmin} />;
};

const AppSummaryHistory = props => <AppSummary {...props} RatingButtonsComponent={RatingsButtons} />;
const columns = [{ name: 'app', header: 'Application', Cell: AppSummaryHistory }];

export const ApplicationListHistoryV2 = ({ initialValues, includeDrafts = undefined, ...props }) => {
  const _id = initialValues?.applications?._id;
  return (
    <GenericTableContainer
      {...defaultApplicationsListProps}
      columns={columns}
      name={name}
      data={useAppHistoryData(name, _id, true, true, includeDrafts)}
      showScroll={true}
      {...props}
    />
  );
};

export const ApplicationListHistoryV2WithDrafts = props => {
  return <ApplicationListHistoryV2 {...props} includeDrafts={true} />;
};
