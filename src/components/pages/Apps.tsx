import * as Tables from '../application/GenericTable';
import { useViewMode } from '../layout/store';
import * as ApplicationHistoryDialog from '../application/GenericDialog/ApplicationHistoryDialog';
import * as SuggestEditDialog from '../application/GenericDialog/SuggestEdit';
import * as ApplicationDialog from '../application/GenericDialog/ApplicationDialog';
import { renderDialogModule } from '../application/GenericDialog/DialogButton';
import SearchHeaderRedux from './SearchHeaderRedux';
import { useTheme } from '@mui/material';
import useAppTableDataTest from './useAppTableDataTest';
import useHeight from '../layout/ViewPort/hooks/useHeight';
import { useHeaderHeight } from '../layout/hooks';

export default function Apps() {
  const [viewMode] = useViewMode() as any;
  const [headerHeight] = useHeaderHeight();
  const height = useHeight();
  const { layout } = useTheme() as any;
  const { tablefooterheight } = layout;
  const tableHeight = height - headerHeight + tablefooterheight + 2 - 40;
  const { filtered } = useAppTableDataTest(); // Trigger data query

  return (
    <>
      {renderDialogModule(ApplicationHistoryDialog)}
      {renderDialogModule(SuggestEditDialog)}
      {renderDialogModule(ApplicationDialog)}
      {viewMode === 'table' ? (
        <Tables.Applications data={filtered} HeaderComponent={SearchHeaderRedux} height={tableHeight} showButtons={false} />
      ) : (
        <Tables.ApplicationsGrid data={filtered} HeaderComponent={SearchHeaderRedux} height={tableHeight} />
      )}
    </>
  );
}
