import React from 'react';
import GenericTableContainer from '../GenericTableContainer';
import { defaultApplicationsListProps } from '../ApplicationsList/table';
import { useAppHistoryData } from '../ApplicationHistory/selectors';
import AppSummary from '../ApplicationsList/AppSummary';
import RatingsColumnHistory from '../Applications/RatingsColumnHistory';

const name = 'App History';

const RatingsButtons = props => <RatingsColumnHistory {...props} isAdmin={true} />;
const AppSummaryHistory = props => <AppSummary {...props} RatingButtonsComponent={RatingsButtons} />;
const columns = [{ name: 'app', header: 'Application', Cell: AppSummaryHistory }];

export const ApplicationListHistoryV2 = ({ initialValues, ...props }) => {
  const _id = initialValues?.applications?._id;
  return (
    <GenericTableContainer
      {...defaultApplicationsListProps}
      columns={columns}
      name={name}
      data={useAppHistoryData(name, _id, true)}
      showScroll={true}
      {...props}
    />
  );
};
