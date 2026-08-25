import * as Tables from '../application/GenericTable';
import { useAdminMode, useViewMode } from '../layout/store';
import * as ApplicationHistoryDialog from '../application/GenericDialog/ApplicationHistoryDialog';
import * as SuggestEditDialog from '../application/GenericDialog/SuggestEdit';
import * as ApplicationDialog from '../application/GenericDialog/ApplicationDialog';
import * as RateNewAppDialog from '../application/GenericDialog/RateNewApp/RateNewAppDialog';
import { renderDialogModule } from '../application/GenericDialog/DialogButton';
import SearchHeaderRedux from './SearchHeaderRedux';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import useAppTableData from './useAppTableData';
import useHeight from '../layout/ViewPort/hooks/useHeight';
import { useHeaderHeight } from '../layout/hooks';
import PublicApplicationsTable from './PublicApplicationsTable';
import AdminToggle from '../application/GenericTable/Applications/AdminToggle';
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
  const { filtered, loading } = useAppTableData(); // Trigger data query

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
      {/* Rendered at the page level so admins can always reach the admin/public
          mode switch — the tables that used to host it aren't mounted until
          adminMode is already on (it renders nothing for non-admins). */}
      <AdminToggle />
      {loading && filtered?.length === 0 ? (
        // Loading gate: never render an empty/partial library as if it were
        // the real result set. Once rows exist they are safe to show while the
        // remaining pages stream in — the current-index only contains current
        // records, so a partial view is missing apps, never showing stale ones.
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: tableHeight }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }} color='textSecondary'>
            Loading apps…
          </Typography>
        </Box>
      ) : effectiveViewMode === 'table' ? (
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
