import * as React from 'react';
import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { RegisteredUsers as RegisteredUsersTable } from '../../application/GenericTable/RegisteredUsers/table';
import { listRegisteredUsers, RegisteredUser } from '../../../database/listRegisteredUsers';
import { useIsSuperAdmin, useSignedIn } from '../../../hooks';
import { useRoster } from '../../../database/useUsers';
import useHeight from '../../layout/ViewPort/hooks/useHeight';
import { useHeaderHeight, useHeaderHeightSetRef } from '../../layout/hooks';
import { useTheme } from '@mui/material';

/*
 * Standalone report page (route /RegisteredUsers) opened in a new tab from
 * Admin > Users. Lists every registered Cognito account — self-registered app
 * raters included — with rating activity derived from the email-index.
 *
 * Super Admin only, twice over: the page refuses to fetch or render for
 * anyone else, and the write API independently verifies the caller's roster
 * role before touching Cognito, so the gate holds even against a hand-crafted
 * request.
 */

const useStyles = makeStyles(({ breakpoints, palette }: any) =>
  createStyles({
    header: {
      background: palette.primary.light,
      padding: '16px 32px',
      [breakpoints.down('sm')]: { padding: '12px 16px' }
    },
    primaryText: {
      fontSize: 30,
      lineHeight: 1.2,
      fontWeight: 900,
      color: palette.primary.dark
    }
  })
);

const Message = ({ children }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, px: 2 }}>
    <Typography color='textSecondary'>{children}</Typography>
  </Box>
);

export default function RegisteredUsers() {
  const classes = useStyles();
  const signedIn = useSignedIn();
  const isSuperAdmin = useIsSuperAdmin();
  // The roster arrives async in a fresh tab; an empty roster means it hasn't
  // loaded yet (it always contains at least the seeded Super Admins), so show
  // a spinner instead of flashing "denied" at a legitimate Super Admin.
  const rosterLoaded = Object.keys(useRoster()).length > 0;

  const [state, setState] = React.useState({ loading: false, error: '', users: [] as RegisteredUser[], statsSkipped: false, loaded: false });

  React.useEffect(() => {
    if (!isSuperAdmin || state.loaded || state.loading) return;
    setState(prev => ({ ...prev, loading: true, error: '' }));
    listRegisteredUsers()
      .then(({ users, statsSkipped }) => setState({ loading: false, error: '', users, statsSkipped, loaded: true }))
      .catch(err => setState(prev => ({ ...prev, loading: false, error: String(err?.message ?? err), loaded: true })));
  }, [isSuperAdmin, state.loaded, state.loading]);

  const height = useHeight();
  const [headerHeight] = useHeaderHeight();
  const { layout } = useTheme() as any;
  const tableHeight = height - headerHeight + layout.tablefooterheight + 18;

  const body = !signedIn ? (
    <Message>Sign in with a Super Admin account to view registered users.</Message>
  ) : !rosterLoaded ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress />
    </Box>
  ) : !isSuperAdmin ? (
    <Message>Viewing registered users requires a Super Admin account.</Message>
  ) : state.error ? (
    <Message>Could not load registered users: {state.error}</Message>
  ) : state.loading || !state.loaded ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress />
    </Box>
  ) : (
    <RegisteredUsersTable users={state.users} statsSkipped={state.statsSkipped} height={tableHeight} />
  );

  return (
    <>
      <Grid ref={useHeaderHeightSetRef()} container className={classes.header} alignItems='center' justifyContent='space-between'>
        <Grid item>
          <Typography className={classes.primaryText}>Registered Users</Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Every account registered on the site (including self-registered app raters), with their rating activity. Read-only; visible to Super Admins only.
          </Typography>
        </Grid>
      </Grid>
      {body}
    </>
  );
}
