import * as Tables from '../application/GenericTable';
import { useAdminMode, useViewMode } from '../layout/store';
import * as ApplicationHistoryDialog from '../application/GenericDialog/ApplicationHistoryDialog';
import * as SuggestEditDialog from '../application/GenericDialog/SuggestEdit';
import * as ApplicationDialog from '../application/GenericDialog/ApplicationDialog';
import * as RateNewAppDialog from '../application/GenericDialog/RateNewApp/RateNewAppDialog';
import { renderDialogModule } from '../application/GenericDialog/DialogButton';
import SearchHeaderRedux from './SearchHeaderRedux';
import { useTheme } from '@mui/material';
import useAppTableData from './useAppTableData';
import useHeight from '../layout/ViewPort/hooks/useHeight';
import { useHeaderHeight } from '../layout/hooks';
import PublicApplicationsTable from './PublicApplicationsTable';

export default function Apps() {
  const [viewMode] = useViewMode() as any;
  const [adminMode] = useAdminMode();
  const [headerHeight] = useHeaderHeight();
  const height = useHeight();
  const { layout } = useTheme() as any;
  const { tablefooterheight } = layout;
  const tableHeight = height - headerHeight + tablefooterheight + 2 - 40;
  const { filtered } = useAppTableData(); // Trigger data query

  return (
    <>
      {renderDialogModule(ApplicationHistoryDialog)}
      {renderDialogModule(SuggestEditDialog)}
      {renderDialogModule(ApplicationDialog)}
      {renderDialogModule(RateNewAppDialog)}
      {viewMode === 'table' ? (
        adminMode ? (
          // Admin mode keeps the full ratings matrix (click-to-pin columns) as a curation tool.
          <Tables.Applications data={filtered} HeaderComponent={SearchHeaderRedux} height={tableHeight} showButtons={false} />
        ) : (
          <>
            <SearchHeaderRedux />
            <PublicApplicationsTable data={filtered} height={tableHeight} />
          </>
        )
      ) : (
        <Tables.ApplicationsGrid data={filtered} HeaderComponent={SearchHeaderRedux} height={tableHeight} />
      )}
    </>
  );
}
