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
import { useT } from '../../../../i18n';

const name = 'Application History';

const AppSummaryHistory = props => <AppSummary {...props} RatingButtonsComponent={RatingsColumnHistory} />;

export const ApplicationListHistory = ({ initialValues, ...props }) => {
  const t = useT();
  const columns = React.useMemo(() => [{ name: 'app', header: t('Application'), Cell: AppSummaryHistory }], [t]);
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
