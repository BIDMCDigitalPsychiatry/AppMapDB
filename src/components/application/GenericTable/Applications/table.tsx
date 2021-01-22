import React from 'react';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import * as Icons from '@material-ui/icons';
import { renderDialogModule } from '../../GenericDialog/DialogButton';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import ViewModeButton from './ViewModeButton';
import { useAppData } from './selectors';
import AdminToggle from './AdminToggle';
import { useColumns } from './columns';
import FilterButton from './FilterButton';
import * as FilterPopover from '../../GenericPopover/Filter';

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

export const Applications = props => {
  const columns = useColumns();
  const { showButtons = true } = props;
  return (
    <>
      {showButtons && (
        <>
          <AdminToggle />
          <FilterButton Module={FilterPopover} table={name} />
          <ViewModeButton mode='table' />
        </>
      )}
      <GenericTableContainer {...defaultApplicationsProps} data={useAppData(name)} columns={columns} showScroll={true} {...props} />
    </>
  );
};
