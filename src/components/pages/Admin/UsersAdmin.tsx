import * as React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Paper,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { Virtuoso } from 'react-virtuoso';
import { useSelector } from 'react-redux';
import { useProcessData, WRITE_API_URL } from '../../../database/useProcessData';
import { useLoadRoster, useRoster, RosterUser } from '../../../database/useUsers';
import { validateEmail } from '../../../helpers';

/*
 * Admin > Users: self-serve roster management (PLAN_MODERNIZATION.md §2).
 * Header (title + Add User) stays pinned; the roster renders in a virtualized
 * list that fills the remaining viewport height, matching the other admin
 * tables. All mutations go through the write API, which re-checks the caller
 * is an admin server-side and enforces the same guardrails this UI shows.
 */

const ROLES: { key: string; label: string; hint: string }[] = [
  { key: 'admin', label: 'Admin', hint: 'Approve/archive ratings and manage users' },
  { key: 'notify', label: 'Notify', hint: 'Receives notification emails (suggest-an-edit, rating interest)' }
];

// email | role columns | status | last changed
const GRID = { display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) 90px 90px 130px 230px', alignItems: 'center', columnGap: 8 } as const;

export default function UsersAdmin({ height = undefined as number | undefined }) {
  useLoadRoster(true);
  const roster = useRoster();
  const processData = useProcessData();
  const { palette } = useTheme();
  const myEmail = String(useSelector((s: any) => s.layout.user?.signInUserSession?.idToken?.payload?.email ?? '')).toLowerCase();

  const users = React.useMemo(
    () => (Object.values(roster) as RosterUser[]).filter(u => u && u.email).sort((a, b) => a.email.localeCompare(b.email)),
    [roster]
  );
  const activeAdminCount = users.filter(u => u.active !== false && (u.roles ?? []).includes('admin')).length;

  const [addOpen, setAddOpen] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState('');
  const [newRoles, setNewRoles] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const save = React.useCallback(
    (user: RosterUser) => {
      setError(undefined);
      processData({
        Model: 'users',
        Action: 'u',
        Data: { ...user, email: user.email.toLowerCase() },
        onError: (response: any) => setError(response?.error ?? 'Update failed')
      });
    },
    [processData]
  );

  const toggleRole = (user: RosterUser, role: string) => {
    const has = (user.roles ?? []).includes(role);
    // UI-side guardrails (the server enforces them regardless)
    if (role === 'admin' && has && user.email === myEmail) return setError('You cannot remove your own admin role');
    if (role === 'admin' && has && activeAdminCount <= 1) return setError('Cannot remove the last active admin');
    save({ ...user, roles: has ? (user.roles ?? []).filter(r => r !== role) : [...(user.roles ?? []), role] });
  };

  const toggleActive = (user: RosterUser) => {
    const deactivating = user.active !== false;
    if (deactivating && user.email === myEmail) return setError('You cannot deactivate your own account');
    if (deactivating && (user.roles ?? []).includes('admin') && activeAdminCount <= 1) return setError('Cannot deactivate the last active admin');
    save({ ...user, active: !deactivating ? true : false });
  };

  const handleAdd = () => {
    const email = newEmail.trim().toLowerCase();
    if (!validateEmail(email)) return setError('Enter a valid email address');
    if (roster[email]) return setError('That email is already on the roster');
    save({ email, roles: newRoles, active: true });
    setAddOpen(false);
    setNewEmail('');
    setNewRoles([]);
  };

  const renderRow = (index: number) => {
    const u = users[index];
    const inactive = u.active === false;
    return (
      <Box
        sx={{
          ...GRID,
          px: 3,
          py: 1,
          minWidth: 820,
          borderBottom: `1px solid ${palette.divider}`,
          bgcolor: 'background.paper',
          opacity: inactive ? 0.55 : 1,
          transition: 'background-color 120ms',
          '&:hover': { bgcolor: 'action.hover' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: 14, fontWeight: 700, bgcolor: inactive ? 'action.disabled' : palette.primary.dark, color: palette.getContrastText(inactive ? palette.action.disabled : palette.primary.dark) }}>
            {u.email.charAt(0).toUpperCase()}
          </Avatar>
          <Typography noWrap sx={{ fontWeight: 500 }}>
            {u.email}
          </Typography>
          {u.email === myEmail && <Chip label='you' size='small' color='primary' variant='outlined' sx={{ height: 20 }} />}
          {inactive && <Chip label='deactivated' size='small' sx={{ height: 20 }} />}
        </Box>
        {ROLES.map(r => (
          <Box key={r.key} sx={{ textAlign: 'center' }}>
            <Checkbox size='small' color='primary' checked={(u.roles ?? []).includes(r.key)} disabled={inactive} onChange={() => toggleRole(u, r.key)} />
          </Box>
        ))}
        <Box sx={{ textAlign: 'center' }}>
          <Button size='small' variant='text' color={inactive ? 'primary' : 'inherit'} sx={{ textTransform: 'none', color: inactive ? undefined : 'text.secondary' }} onClick={() => toggleActive(u)}>
            {inactive ? 'Reactivate' : 'Deactivate'}
          </Button>
        </Box>
        <Typography variant='caption' color='textSecondary' noWrap>
          {u.updated ? new Date(u.updated).toLocaleDateString() : ''} {u.updatedBy ? `by ${u.updatedBy}` : ''}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ height: height ?? '100%', px: { xs: 1, sm: 3 }, py: 2, boxSizing: 'border-box' }}>
      <Paper
        elevation={0}
        sx={{ height: '100%', maxWidth: 1140, mx: 'auto', display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden', border: `1px solid ${palette.divider}` }}
      >
        {/* Pinned header */}
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, borderBottom: `1px solid ${palette.divider}` }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant='h5' sx={{ fontWeight: 700, color: palette.primary.dark }}>
              Users &amp; Roles
            </Typography>
            <Typography variant='body2' color='textSecondary'>
              Changes take effect immediately and are recorded with who made them. Role checks are enforced server-side
              {!WRITE_API_URL && ' (write API not configured — changes will not be permitted)'}.
            </Typography>
          </Box>
          <Button variant='contained' disableElevation sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }} onClick={() => setAddOpen(true)}>
            Add User
          </Button>
        </Box>

        {error && (
          <Alert severity='error' onClose={() => setError(undefined)} sx={{ borderRadius: 0 }}>
            {error}
          </Alert>
        )}

        {/* Column headers (pinned above the scroll area) */}
        <Box sx={{ ...GRID, px: 3, py: 1, minWidth: 820, bgcolor: 'action.hover', borderBottom: `1px solid ${palette.divider}` }}>
          <Typography variant='caption' sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {users.length} Users
          </Typography>
          {ROLES.map(r => (
            <Tooltip key={r.key} title={r.hint} placement='top'>
              <Typography variant='caption' sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center', cursor: 'default' }}>
                {r.label}
              </Typography>
            </Tooltip>
          ))}
          <Typography variant='caption' sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>
            Status
          </Typography>
          <Typography variant='caption' sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Last changed
          </Typography>
        </Box>

        {/* Virtualized roster fills the remaining height */}
        <Box sx={{ flex: 1, minHeight: 0, overflowX: 'auto' }}>
          {users.length > 0 ? (
            <Virtuoso totalCount={users.length} itemContent={renderRow} style={{ height: '100%' }} />
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color='textSecondary'>Roster is empty or still loading…</Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth='xs' fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add User</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label='Email address' value={newEmail} onChange={e => setNewEmail(e.target.value)} sx={{ mt: 1 }} />
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column' }}>
            {ROLES.map(r => (
              <FormControlLabel
                key={r.key}
                control={<Checkbox checked={newRoles.includes(r.key)} onChange={() => setNewRoles(prev => (prev.includes(r.key) ? prev.filter(x => x !== r.key) : [...prev, r.key]))} />}
                label={
                  <span>
                    <b>{r.label}</b>
                    <Typography component='span' variant='body2' color='textSecondary'>
                      {' '}
                      — {r.hint}
                    </Typography>
                  </span>
                }
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button sx={{ textTransform: 'none' }} onClick={() => setAddOpen(false)}>
            Cancel
          </Button>
          <Button variant='contained' disableElevation sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }} onClick={handleAdd}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
