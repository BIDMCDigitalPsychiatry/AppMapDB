import * as React from 'react';
import { Box, Divider, useTheme } from '@material-ui/core';
import { useHeaderHeight, useHeight, useRouteState } from '../../layout/store';
import AdminLayoutSelector from './AdminLayoutSelector';
import AdminPendingApprovals from './AdminPendingApprovals';
import { Surveys } from '../../application/GenericTable/Surveys/table';

export default function Admin() {
  const headerHeight = useHeaderHeight();
  const [{ adminLayout = 'pending' }] = useRouteState();

  const height = useHeight();
  const { layout, palette } = useTheme() as any;
  const { tablefooterheight } = layout;

  const selectorHeight = 104;

  const tableHeight = height - headerHeight - selectorHeight + tablefooterheight + 18;

  return (
    <Box pt={3} bgcolor={palette.primary.light}>
      <AdminLayoutSelector />
      <Divider style={{ marginTop: 16 }} />
      {adminLayout === 'surveys' ? <Surveys height={tableHeight + headerHeight} /> : <AdminPendingApprovals height={tableHeight} />}
    </Box>
  );
}
