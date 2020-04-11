import React from 'react';
import { defaultApplicationsProps } from '../Applications/table';
import { useSignedIn } from '../../../../hooks';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import AdminToggle from '../Applications/AdminToggle';
import ViewModeButton from '../Applications/ViewModeButton';
import { TableFilterDialogButton } from '../../GenericDialog/DialogButton';
import * as FilterPopover from '../../GenericPopover/Filter';
import { useAppHistoryData } from './selectors';

const name = 'Applications History';

const defaultProps: GenericTableContainerProps = {
  name,
  buttons: [<AdminToggle />, <ViewModeButton mode='table' />, <TableFilterDialogButton Module={FilterPopover} table={name} />]
};

export const ApplicationHistory = ({ initialValues, ...props }) => {
  var { columns = [] } = defaultApplicationsProps;
  const _id = initialValues?.applications?._id;
  const signedIn = useSignedIn();
  columns = signedIn ? columns : (columns as []).filter((c: any) => c.name !== 'rating');
  return (
    <GenericTableContainer {...defaultApplicationsProps} {...defaultProps} data={useAppHistoryData(name, _id)} columns={columns} showScroll={true} {...props} />
  );
};
