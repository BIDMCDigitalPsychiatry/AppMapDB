import * as React from 'react';
import { Box, Button, CircularProgress, Divider, Paper, Typography, useTheme } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { useLocation } from 'react-router';
import { useRouteState } from '../../layout/store';
import AdminLayoutSelector from './AdminLayoutSelector';
import AdminPendingApprovals from './AdminPendingApprovals';
import UsersAdmin from './UsersAdmin';
import AppSubmissions from './AppSubmissions';
import { Surveys } from '../../application/GenericTable/Surveys/table';
import useHeight from '../../layout/ViewPort/hooks/useHeight';
import { useHandleChangeRoute, useHeaderHeight } from '../../layout/hooks';
import { useIsAdmin, useIsSubmissionReviewer, useIsSuperAdmin, useSignedIn } from '../../../hooks';
import { useRoster } from '../../../database/useUsers';
import { useT } from '../../../i18n';
import { publicUrl } from '../../../helpers';

const AdminAccessNotice = ({ signedIn }: { signedIn: boolean }) => {
  const t = useT();
  const changeRoute = useHandleChangeRoute();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', px: 2, py: { xs: 6, md: 10 } }}>
      <Paper variant='outlined' sx={{ maxWidth: 520, p: { xs: 3, md: 4 }, textAlign: 'center', borderRadius: 3 }}>
        <Icons.LockOutlined color='primary' sx={{ fontSize: 48 }} />
        <Typography variant='h5' sx={{ fontWeight: 800, mt: 1, color: 'primary.dark' }}>
          {signedIn ? t('No access') : t('Sign in required')}
        </Typography>
        <Typography sx={{ mt: 1.5 }} color='text.secondary'>
          {signedIn
            ? t('Your account doesn’t have access to the admin area. If you think it should, contact a Super Admin.')
            : t('The admin area is only available to signed-in team members. Please sign in from the account menu (top right).')}
        </Typography>
        <Button variant='contained' sx={{ mt: 3, textTransform: 'none' }} onClick={changeRoute(publicUrl('/Apps'))}>
          {t('Back to the app library')}
        </Button>
      </Paper>
    </Box>
  );
};

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

  // Page-level guard: only admins, Super Admins and Submission Reviewers see the admin area. (Typing /Admin
  // used to render Pending Approvals for anyone.) Roles come from the roster, which loads after the page —
  // show a spinner until it has, so a real admin never sees a flash of "no access". The admin views (and
  // their data requests) only mount once access is confirmed. Server-side checks still guard every action.
  const signedIn = useSignedIn();
  const rosterLoaded = Object.keys(useRoster()).length > 0;
  const hasAccess = isAdmin || isSuperAdmin || isSubmissionReviewer;
  if (!hasAccess) {
    if (signedIn && !rosterLoaded)
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      );
    return <AdminAccessNotice signedIn={signedIn} />;
  }

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
