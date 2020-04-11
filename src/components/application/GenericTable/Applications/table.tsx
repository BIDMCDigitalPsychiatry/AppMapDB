import React from 'react';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import * as Icons from '@material-ui/icons';
import { TableFilterDialogButton, renderDialogModule } from '../../GenericDialog/DialogButton';
import * as FilterPopover from '../../GenericPopover/Filter';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import ViewModeButton from './ViewModeButton';
import { useAppData } from './selectors';
import AdminToggle from './AdminToggle';
import { columns } from './columns';

export const name = 'Applications';
const center = text => <div style={{ textAlign: 'center' }}>{text}</div>;

export const CenterRadio = ({ checked = false }) => {
  const Icon = checked ? Icons.RadioButtonChecked : Icons.RadioButtonUnchecked;
  return center(<Icon color='action' fontSize='small' />);
};

export const defaultApplicationsProps: GenericTableContainerProps = {
  name,
  dialogs: [renderDialogModule(RateNewAppDialog)],
  toolbar: true,
  footer: true,
  search: true,
  buttons: [<AdminToggle />, <ViewModeButton mode='table' />, <TableFilterDialogButton Module={FilterPopover} table={name} />]
};

export const Applications = props => {
  return <GenericTableContainer {...defaultApplicationsProps} data={useAppData(name)} columns={columns} showScroll={true} {...props} />;
};
