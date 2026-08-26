import * as React from 'react';
import { Box, Chip, MenuItem, Paper, Select, Typography } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useAdminMode, useSetUser } from './store';
import { useIsAdmin, useSignedInPro, useSignedInRater } from '../../hooks';

/**
 * LOCAL-DATA-MODE ONLY. A dev-time role switcher for testing that public
 * changes haven't broken the volunteer/rater or admin experiences.
 *
 * It does NOT touch authentication. Every role in this app is derived from
 * the shape of `state.layout.user` (see src/hooks.tsx):
 *
 *   signed out   → user === undefined
 *   app rater    → user set, no `custom:userType: 'pro'` attribute
 *   pro user     → user set, `custom:userType: 'pro'`
 *   admin        → user set AND idToken email is in package.json `adminUsers`
 *                  (admins are also raters — `useSignedInRater` is just
 *                  signed-in-and-not-pro)
 *
 * So this simply dispatches a correctly-shaped fake user, exactly as the real
 * Cognito login does via `useSetUser`. Nothing in the auth path is modified,
 * no real credentials exist, and the whole component is compiled out unless
 * REACT_APP_USE_LOCAL_DATA=true (i.e. `npm run start:local`).
 *
 * The admin email below is one already present in package.json's `adminUsers`
 * list — no production permission list is changed to make this work.
 */

const ADMIN_EMAIL = 'team@digitalpsych.org'; // holds the admin role in the users table
const RATER_EMAIL = 'local.rater@example.com'; // deliberately NOT an admin
const PRO_EMAIL = 'local.pro@example.com';

const makeUser = (email: string, userType?: 'pro') => ({
  username: email,
  attributes: {
    email,
    email_verified: true,
    ...(userType ? { 'custom:userType': userType } : {})
  },
  signInUserSession: {
    idToken: {
      payload: { email, email_verified: true }
    }
  }
});

const ROLES = {
  public: { label: 'Public (signed out)', user: undefined },
  rater: { label: 'App rater (volunteer)', user: makeUser(RATER_EMAIL) },
  pro: { label: 'Pro user', user: makeUser(PRO_EMAIL, 'pro') },
  admin: { label: 'Admin', user: makeUser(ADMIN_EMAIL) }
};

const enabled = process.env.NODE_ENV !== 'production' && process.env.REACT_APP_USE_LOCAL_DATA === 'true';

export default function DevRoleSwitcher() {
  const setUser = useSetUser();
  // useAdminMode returns an untyped tuple, so TS widens both slots to
  // boolean | setter; annotate to keep the setter callable.
  const [adminMode, setAdminMode] = useAdminMode() as [boolean, (v: boolean) => void];
  const isAdmin = useIsAdmin();
  const isRater = useSignedInRater();
  const isPro = useSignedInPro();
  const email = useSelector((s: any) => s.layout.user?.signInUserSession?.idToken?.payload?.email);
  const [collapsed, setCollapsed] = React.useState(false);

  if (!enabled) return null;

  const current = !email ? 'public' : isAdmin ? 'admin' : isPro ? 'pro' : 'rater';

  const handleChange = (event: any) => {
    const role = event.target.value as keyof typeof ROLES;
    setUser(ROLES[role].user);
    // Admin mode is a separate toggle gated on isAdmin; leaving it on while
    // switching down to a public role would be a confusing half-state.
    if (role !== 'admin') setAdminMode(false);
  };

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'fixed',
        left: 12,
        bottom: 12,
        zIndex: 1400,
        p: collapsed ? 0.5 : 1.25,
        borderRadius: 2,
        border: '1px dashed #B45309',
        bgcolor: '#FFFBEB'
      }}
    >
      {collapsed ? (
        <Chip
          size='small'
          icon={<Icons.BugReport />}
          label={ROLES[current].label}
          onClick={() => setCollapsed(false)}
          sx={{ cursor: 'pointer', bgcolor: 'transparent' }}
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: 210 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Icons.BugReport fontSize='small' sx={{ color: '#B45309' }} />
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: '#B45309', flex: 1 }}>DEV ROLE (local data only)</Typography>
            <Icons.Close fontSize='small' sx={{ cursor: 'pointer', color: '#B45309' }} onClick={() => setCollapsed(true)} />
          </Box>
          <Select size='small' value={current} onChange={handleChange} sx={{ bgcolor: 'white', fontSize: 13 }}>
            {Object.entries(ROLES).map(([key, { label }]) => (
              <MenuItem key={key} value={key} sx={{ fontSize: 13 }}>
                {label}
              </MenuItem>
            ))}
          </Select>
          {isAdmin && (
            <Chip
              size='small'
              color={adminMode ? 'primary' : 'default'}
              variant={adminMode ? 'filled' : 'outlined'}
              label={adminMode ? 'Admin mode: ON' : 'Admin mode: OFF'}
              onClick={() => setAdminMode(!adminMode)}
              sx={{ cursor: 'pointer' }}
            />
          )}
          <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
            {email ? email : 'no user'}
            {isRater && !isAdmin ? ' · rater' : ''}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
