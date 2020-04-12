import React from 'react';
import { defaultApplicationsProps } from '../Applications/table';
import { useSignedIn } from '../../../../hooks';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import AdminToggle from '../Applications/AdminToggle';
import ViewModeButton from '../Applications/ViewModeButton';
import { TableFilterDialogButton } from '../../GenericDialog/DialogButton';
import * as FilterPopover from '../../GenericPopover/Filter';
import { useAppHistoryData } from './selectors';
import { columns } from '../Applications/columns';
import RatingsColumnHistory from '../Applications/RatingsColumnHistory';

const name = 'Applications History';

const defaultProps: GenericTableContainerProps = {
  name,
  buttons: [<AdminToggle />, <ViewModeButton mode='table' />, <TableFilterDialogButton Module={FilterPopover} table={name} />]
};

export const customRatingColumn = { name: 'rating', header: 'Rating', width: 300, Cell: RatingsColumnHistory };

export const ApplicationHistory = ({ initialValues, ...props }) => {
  const _id = initialValues?.applications?._id;
  const signedIn = useSignedIn();

  // Ensure we make a copy of columns here so react updates work correctly
  const Columns = [...(signedIn ? columns : (columns as []).filter((c: any) => c.name !== 'rating'))];
  const ratingIndex = Columns.findIndex(c => c.name === 'rating');
  if (ratingIndex > -1) {
    Columns.splice(ratingIndex, 1, customRatingColumn);
  }

  return (
    <GenericTableContainer
      {...defaultApplicationsProps}
      {...defaultProps}
      data={useAppHistoryData(name, _id)}
      columns={[...Columns]}
      showScroll={true}
      {...props}
    />
  );
};
