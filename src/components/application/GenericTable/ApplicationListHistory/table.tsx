import React from 'react';
import GenericTableContainer from '../GenericTableContainer';
import { defaultApplicationsListProps } from '../ApplicationsList/table';
import { useAppHistoryData } from '../ApplicationHistory/selectors';
import AppSummary from '../ApplicationsList/AppSummary';
import RatingsColumnHistory from '../Applications/RatingsColumnHistory';
import ViewModeButton from '../Applications/ViewModeButton';
import AdminToggle from '../Applications/AdminToggle';
import * as FilterPopover from '../../GenericPopover/Filter';
import FilterButton from '../Applications/FilterButton';

const name = 'Application History';

const AppSummaryHistory = props => <AppSummary {...props} RatingButtonsComponent={RatingsColumnHistory} />;
const columns = [{ name: 'app', header: 'Application', Cell: AppSummaryHistory }];

export const ApplicationListHistory = ({ initialValues, ...props }) => {
  const _id = initialValues?.applications?._id;
  return (
    <>
      <FilterButton Module={FilterPopover} table={name} />
      <AdminToggle />
      <ViewModeButton />
      <GenericTableContainer {...defaultApplicationsListProps} columns={columns} name={name} data={useAppHistoryData(name, _id)} showScroll={true} {...props} />
    </>
  );
};
