import { useTheme } from '@mui/material';
import * as React from 'react';
import TabSelectorTextToolBar from '../../general/TabSelector/TabSelectorTextToolBar';
import { useIsSuperAdmin } from '../../../hooks';

const AdminLayoutSelector = ({ subRoute, ...other }) => {
  const { palette } = useTheme();
  // The Users roster tab is visible to Super Admins only (the write API
  // enforces this server-side regardless of what the UI shows).
  const isSuperAdmin = useIsSuperAdmin();
  const tabs = React.useMemo(
    () =>
      [
        { id: 'Pending Approvals', route: '/Admin', routeState: { subRoute: 'pending' } },
        { id: 'Surveys', route: '/Admin', routeState: { subRoute: 'surveys' } },
        isSuperAdmin && { id: 'Users', route: '/Admin', routeState: { subRoute: 'users' } }
      ].filter(t => t),
    [isSuperAdmin]
  );
  return <TabSelectorTextToolBar id='AdminLayoutSelector' labelColor={palette.primary.dark} tabs={tabs} {...other} />;
};

export default AdminLayoutSelector;
