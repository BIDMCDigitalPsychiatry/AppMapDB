import * as Tables from '../application/GenericTable';
import { useTheme } from '@mui/material';
import useAppTableData from '../pages/useAppTableData';
import useHeight from '../layout/ViewPort/hooks/useHeight';
import { useHeaderHeight } from '../layout/hooks';

export default function PwaApps() {
  const [headerHeight] = useHeaderHeight();
  const height = useHeight();
  const { layout } = useTheme() as any;
  const { tablefooterheight } = layout;
  const tableHeight = height + tablefooterheight - headerHeight + 8;
  const { filtered } = useAppTableData({ trigger: false }); // Don't re-trigger here as it causes a refresh

  return <Tables.PwaApplicationsGrid data={filtered} height={tableHeight} />;
}
