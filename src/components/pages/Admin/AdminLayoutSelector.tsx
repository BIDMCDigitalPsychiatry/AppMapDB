import { useTheme } from '@mui/material';
import * as React from 'react';
import TabSelectorTextToolBar from '../../general/TabSelector/TabSelectorTextToolBar';
import { useIsAdmin, useIsSubmissionReviewer, useIsSuperAdmin } from '../../../hooks';

const AdminLayoutSelector = ({ subRoute, ...other }) => {
  const { palette } = useTheme();
  // Each tab shows only to roles that can act on it (the write API enforces
  // all of this server-side regardless of what the UI shows): approvals and
  // surveys need admin; App Submissions need Submission Reviewer (or Super
  // Admin); the Users roster needs Super Admin.
  const isAdmin = useIsAdmin();
  const isSuperAdmin = useIsSuperAdmin();
  const isSubmissionReviewer = useIsSubmissionReviewer();
  const tabs = React.useMemo(
    () =>
      [
        isAdmin && { id: 'Pending Approvals', route: '/Admin', routeState: { subRoute: 'pending' } },
        isSubmissionReviewer && { id: 'App Suggestions', route: '/Admin', routeState: { subRoute: 'submissions' } },
        isAdmin && { id: 'Surveys', route: '/Admin', routeState: { subRoute: 'surveys' } },
        isSuperAdmin && { id: 'Users', route: '/Admin', routeState: { subRoute: 'users' } }
      ].filter(t => t),
    [isAdmin, isSuperAdmin, isSubmissionReviewer]
  );
  return <TabSelectorTextToolBar id='AdminLayoutSelector' labelColor={palette.primary.dark} tabs={tabs} {...other} />;
};

export default AdminLayoutSelector;
