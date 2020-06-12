import React from 'react';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import * as Icons from '@material-ui/icons';
import { renderDialogModule } from '../../GenericDialog/DialogButton';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import ViewModeButton from './ViewModeButton';
import { useAppData } from './selectors';
import AdminToggle from './AdminToggle';
import { columns } from './columns';
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
  const [pinned, setPinned] = React.useState([]);
  const handlePinColumn = React.useCallback(name => setPinned(prev => [name, ...prev.filter(c => c !== name)]), [setPinned]);

  const staticColumns = columns.filter(c => c.hoverable === false);
  const dynamicColumns = columns.filter(c => c.hoverable !== false);

  const pinnedColumns = pinned.map(name => dynamicColumns.find(c => c.name === name));
  const remainingColumns = dynamicColumns.filter(c => !pinned.includes(c.name));

  const mergedColumns = [...staticColumns, ...pinnedColumns, ...remainingColumns].map(c => ({
    ...c,
    onHeaderClick: false
  }));

  return (
    <>
      <AdminToggle />
      <FilterButton Module={FilterPopover} table={name} />
      <ViewModeButton mode='table' />
      <GenericTableContainer
        {...defaultApplicationsProps}
        isCellHovered={(column, rowData, hoveredColumn, hoveredRowData) => column.name === hoveredColumn.name && column.hoverable !== false}
        onHeaderClick={(event, { column }) => handlePinColumn(column.name)}
        onCellClick={(event, { column, rowData }) => handlePinColumn(column.name)}
        data={useAppData(name)}
        columns={mergedColumns}
        showScroll={true}
        {...props}
      />
    </>
  );
};
