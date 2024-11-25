import * as Tables from '../application/GenericTable';
import { useTheme } from '@mui/material';
import useHeight from '../layout/ViewPort/hooks/useHeight';
import { useHeaderHeight } from '../layout/hooks';
import useAppTableData from '../pages/useAppTableData';

export default function PwaApps() {
  const [headerHeight] = useHeaderHeight();
  const height = useHeight();
  const { layout } = useTheme() as any;
  const { tablefooterheight } = layout;
  const tableHeight = height + tablefooterheight - headerHeight - 4;
  const { filtered } = useAppTableData({ trigger: false, mode: 'pwa' }); // Don't re-trigger here as it causes a refresh

  return <Tables.PwaApplicationsGrid data={filtered} height={tableHeight} />;
}
