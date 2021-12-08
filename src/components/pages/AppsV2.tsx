import * as React from 'react';
import * as Tables from '../application/GenericTable';
import { useHeaderHeight, useHeight, useViewMode } from '../layout/store';
import * as ApplicationHistoryDialog from '../application/GenericDialog/ApplicationHistoryDialog';
import * as SuggestEditDialog from '../application/GenericDialog/SuggestEdit';
import * as ApplicationDialog from '../application/GenericDialog/ApplicationDialog';
import { renderDialogModule } from '../application/GenericDialog/DialogButton';
import SearchHeaderRedux from './SearchHeaderRedux';
import { useTheme } from '@material-ui/core';
import useAppTableData from './useAppTableData';

export default function AppsV2() {
  const [viewMode] = useViewMode() as any;  
  const headerHeight = useHeaderHeight();
  const height = useHeight();
  const { layout } = useTheme() as any;
  const { tablefooterheight } = layout;
  const tableHeight = height - headerHeight + tablefooterheight + 2;

  useAppTableData();  // Trigger data query

  return (
    <>
      {renderDialogModule(ApplicationHistoryDialog)}
      {renderDialogModule(SuggestEditDialog)}
      {renderDialogModule(ApplicationDialog)}
      {viewMode === 'table' ? (
        <Tables.Applications HeaderComponent={SearchHeaderRedux} height={tableHeight} showButtons={false} />
      ) : (
        <Tables.ApplicationsSummary HeaderComponent={SearchHeaderRedux} height={tableHeight} />
      )}
    </>
  );
}
