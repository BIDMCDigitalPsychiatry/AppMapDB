import { Box, Divider, useTheme } from '@mui/material';
import { useRouteState } from '../../layout/store';
import AdminLayoutSelector from './AdminLayoutSelector';
import AdminPendingApprovals from './AdminPendingApprovals';
import UsersAdmin from './UsersAdmin';
import { Surveys } from '../../application/GenericTable/Surveys/table';
import useHeight from '../../layout/ViewPort/hooks/useHeight';
import { useHeaderHeight } from '../../layout/hooks';
import { useIsSuperAdmin } from '../../../hooks';

export default function Admin() {
  const [headerHeight] = useHeaderHeight();
  const [{ subRoute: requestedSubRoute = 'pending' }] = useRouteState();
  // The Users roster is Super Admin only — anyone else landing on that
  // subRoute falls back to the pending queue (server-side checks apply too).
  const isSuperAdmin = useIsSuperAdmin();
  const subRoute = requestedSubRoute === 'users' && !isSuperAdmin ? 'pending' : requestedSubRoute;

  const height = useHeight();
  const { layout, palette } = useTheme() as any;
  const { tablefooterheight } = layout;

  const selectorHeight = 104;

  const tableHeight = height - headerHeight - selectorHeight + tablefooterheight + 18;

  return (
    <Box pt={3} bgcolor={palette.primary.light}>
      <AdminLayoutSelector subRoute={subRoute} />
      <Divider style={{ marginTop: 16 }} />
      {subRoute === 'surveys' ? <Surveys height={tableHeight + headerHeight} /> : subRoute === 'users' ? <UsersAdmin height={tableHeight} /> : <AdminPendingApprovals height={tableHeight} />}
    </Box>
  );
}
