import React from 'react';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import * as Icons from '@material-ui/icons';
import { renderDialogModule } from '../../GenericDialog/DialogButton';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import { useColumns } from './columns';
import FilterButtonBottom from '../Applications/FilterButtonBottom';
import * as FilterPopover from '../../GenericPopover/Filter';
import { usePendingAppData } from '../Applications/selectors';

export const name = 'Applications';
const center = text => <div style={{ textAlign: 'center' }}>{text}</div>;

export const CenterRadio = ({ checked = false }) => {
  const Icon = checked ? Icons.RadioButtonChecked : Icons.RadioButtonUnchecked;
  return center(<Icon color='action' fontSize='small' />);
};

export const defaultApplicationsProps: GenericTableContainerProps = {
  name,
  dialogs: [renderDialogModule(RateNewAppDialog)],
  toolbar: false,
  footer: true,
  search: false
};

export const ApplicationsPending = ({ showArchived = false, email = undefined, ...props }) => {
  const columns = useColumns({email});
  return (
    <>
      <FilterButtonBottom Module={FilterPopover} table={name} />
      <GenericTableContainer {...defaultApplicationsProps} data={usePendingAppData(name, showArchived, email)} columns={columns} showScroll={true} {...props} />
    </>
  );
};
