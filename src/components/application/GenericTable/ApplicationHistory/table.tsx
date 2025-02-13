import React from 'react';
import { defaultApplicationsProps } from '../Applications/table';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import AdminToggle from '../Applications/AdminToggle';
import ViewModeButton from '../Applications/ViewModeButton';
import { useAppHistoryData } from './selectors';
import { useColumns } from '../Applications/columns';
import RatingsColumnHistory from '../Applications/RatingsColumnHistory';
import * as FilterPopover from '../../GenericPopover/Filter';
import TableFilterDialogButton from '../Applications/FilterButton';
import { useSignedInRater } from '../../../../hooks';

const name = 'Applications History';

const defaultProps: GenericTableContainerProps = {
  name
};

export const customRatingColumn = { name: 'rating', header: 'Rating', width: 300, Cell: RatingsColumnHistory, hoverable: false };

export const ApplicationHistory = ({ initialValues, ...props }) => {
  const _id = initialValues?.applications?._id;
  const signedInRater = useSignedInRater();

  const columns = useColumns();

  // Ensure we make a copy of columns here so react updates work correctly
  const Columns = [...(signedInRater ? columns : (columns as []).filter((c: any) => c.name !== 'rating'))];
  const ratingIndex = Columns.findIndex(c => c.name === 'rating');
  if (ratingIndex > -1) {
    Columns.splice(ratingIndex, 1, customRatingColumn);
  }

  return (
    <>
      <TableFilterDialogButton Module={FilterPopover} table={name} />
      <ViewModeButton mode='table' />
      <AdminToggle />
      <GenericTableContainer
        {...defaultApplicationsProps}
        {...defaultProps}
        data={useAppHistoryData(name, _id)}
        columns={[...Columns]}
        showScroll={true}
        {...props}
      />
    </>
  );
};
