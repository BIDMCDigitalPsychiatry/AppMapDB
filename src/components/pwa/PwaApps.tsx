import * as Tables from '../application/GenericTable';
import SearchHeaderRedux from '../pages/SearchHeaderRedux';
import { useTheme } from '@mui/material';
import useAppTableData from '../pages/useAppTableData';
import useHeight from '../layout/ViewPort/hooks/useHeight';
import { useAppBarHeight, useHeaderHeight } from '../layout/hooks';

export default function PwaApps() {
  const [headerHeight] = useHeaderHeight();
  const [appBarHeight] = useAppBarHeight();
  const height = useHeight();
  const { layout } = useTheme() as any;
  const { tablefooterheight } = layout;
  //const tableHeight = height - headerHeight + tablefooterheight + 2 - 40;
  const tableHeight = height - appBarHeight + tablefooterheight;
  const { filtered } = useAppTableData(); // Trigger data query

  console.log({ headerHeight, appBarHeight, tablefooterheight, tableHeight });

  return <Tables.PwaApplicationsGrid data={filtered} height={tableHeight} />;
}