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
import SearchAssistant from './SearchAssistant/SearchAssistant';
import useFilterMetrics from './SearchAssistant/useFilterMetrics';
import { useFullScreen } from '../../hooks';

export default function Apps() {
  const [viewMode] = useViewMode() as any;
  const [adminMode] = useAdminMode();
  const [headerHeight] = useHeaderHeight();
  const height = useHeight();
  const { layout } = useTheme() as any;
  const { tablefooterheight } = layout;
  const tableHeight = height - headerHeight + tablefooterheight + 2 - 40;
  const { filtered } = useAppTableData(); // Trigger data query

  // Anonymous, counts-only record of manual filter use: the control group the
  // chat assistant gets measured against. Category names only, never values.
  useFilterMetrics(filtered?.length ?? 0);

  // The table view (dense rows/columns, or the full admin ratings matrix)
  // isn't workable on a phone screen — always fall back to the card grid.
  const isMobile = useFullScreen('sm');
  const effectiveViewMode = isMobile ? 'grid' : viewMode;

  return (
    <>
      {renderDialogModule(ApplicationHistoryDialog)}
      {renderDialogModule(SuggestEditDialog)}
      {renderDialogModule(ApplicationDialog)}
      {renderDialogModule(RateNewAppDialog)}
      {effectiveViewMode === 'table' ? (
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
      {/* Public-only chat assistant; renders nothing in admin mode or when no endpoint is configured */}
      {!adminMode && <SearchAssistant />}
    </>
  );
}
