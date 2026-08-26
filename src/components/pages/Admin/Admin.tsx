import { Box, Divider, useTheme } from '@mui/material';
import { useRouteState } from '../../layout/store';
import AdminLayoutSelector from './AdminLayoutSelector';
import AdminPendingApprovals from './AdminPendingApprovals';
import UsersAdmin from './UsersAdmin';
import { Surveys } from '../../application/GenericTable/Surveys/table';
import useHeight from '../../layout/ViewPort/hooks/useHeight';
import { useHeaderHeight } from '../../layout/hooks';
import { useIsAdmin, useIsSuperAdmin } from '../../../hooks';

export default function Admin() {
  const [headerHeight] = useHeaderHeight();
  const [{ subRoute: requestedSubRoute = 'pending' }] = useRouteState();
  // Land each role on a tab it can actually use: the Users roster is Super
  // Admin only; approvals/surveys are admin only. A Super Admin without the
  // admin role defaults to Users. (Server-side checks apply regardless.)
  const isAdmin = useIsAdmin();
  const isSuperAdmin = useIsSuperAdmin();
  const subRoute =
    requestedSubRoute === 'users' && !isSuperAdmin ? 'pending' : !isAdmin && isSuperAdmin && requestedSubRoute !== 'users' ? 'users' : requestedSubRoute;

  const height = useHeight();
  const { layout, palette } = useTheme() as any;
  const { tablefooterheight } = layout;

  // Tightened: was pt={3} + selectorHeight 104 — the tab strip carried ~24px
  // of dead space above it.
  const selectorHeight = 88;

  const tableHeight = height - headerHeight - selectorHeight + tablefooterheight + 18;

  return (
    <Box pt={1} bgcolor={palette.primary.light}>
      <AdminLayoutSelector subRoute={subRoute} />
      <Divider style={{ marginTop: 8 }} />
      {subRoute === 'surveys' ? <Surveys height={tableHeight + headerHeight} /> : subRoute === 'users' ? <UsersAdmin height={tableHeight} /> : <AdminPendingApprovals height={tableHeight} />}
    </Box>
  );
}
