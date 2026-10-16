import * as React from 'react';
import { Box, Divider, useTheme } from '@mui/material';
import { useLocation } from 'react-router';
import { useRouteState } from '../../layout/store';
import AdminLayoutSelector from './AdminLayoutSelector';
import AdminPendingApprovals from './AdminPendingApprovals';
import UsersAdmin from './UsersAdmin';
import AppSubmissions from './AppSubmissions';
import { Surveys } from '../../application/GenericTable/Surveys/table';
import useHeight from '../../layout/ViewPort/hooks/useHeight';
import { useHeaderHeight } from '../../layout/hooks';
import { useIsAdmin, useIsSubmissionReviewer, useIsSuperAdmin } from '../../../hooks';

export default function Admin() {
  const [headerHeight] = useHeaderHeight();
  const [{ subRoute: requestedSubRoute = 'pending' }, setRouteState] = useRouteState();
  const { search } = useLocation();

  // Deep link from the reviewer notification email: /Admin?tab=submissions
  React.useEffect(() => {
    const tab = new URLSearchParams(search).get('tab');
    if (tab === 'submissions') setRouteState({ subRoute: 'submissions' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Land each role on a tab it can actually use: approvals/surveys are admin
  // only; App Submissions need Submission Reviewer (or Super Admin); the Users
  // roster is Super Admin only. (Server-side checks apply regardless.)
  const isAdmin = useIsAdmin();
  const isSuperAdmin = useIsSuperAdmin();
  const isSubmissionReviewer = useIsSubmissionReviewer();
  const allowed = [isAdmin && 'pending', isSubmissionReviewer && 'submissions', isAdmin && 'surveys', isSuperAdmin && 'users'].filter(Boolean) as string[];
  const subRoute = allowed.includes(requestedSubRoute) ? requestedSubRoute : allowed[0] ?? 'pending';

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
      {subRoute === 'surveys' ? (
        <Surveys height={tableHeight + headerHeight} />
      ) : subRoute === 'users' ? (
        <UsersAdmin height={tableHeight} />
      ) : subRoute === 'submissions' ? (
        <AppSubmissions height={tableHeight} />
      ) : (
        <AdminPendingApprovals height={tableHeight} />
      )}
    </Box>
  );
}
