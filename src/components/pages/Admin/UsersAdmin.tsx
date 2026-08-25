import * as React from 'react';
import {
  Alert,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useProcessData } from '../../../database/useProcessData';
import { useLoadRoster, useRoster, RosterUser } from '../../../database/useUsers';
import { WRITE_API_URL } from '../../../database/useProcessData';
import { validateEmail } from '../../../helpers';

/*
 * Admin > Users: self-serve roster management (PLAN_MODERNIZATION.md §2).
 * Reads the `users` table (loaded once per session into the store); all
 * mutations go through the write API, which re-checks the caller is an admin
 * server-side and enforces the same guardrails this UI shows (you cannot
 * remove your own admin role; the last active admin cannot be deactivated).
 */

const ROLES: { key: string; label: string; hint: string }[] = [
  { key: 'admin', label: 'Admin', hint: 'approve/archive ratings, manage users' },
  { key: 'tester', label: 'Tester', hint: 'sees test-only features' },
  { key: 'notify', label: 'Notify', hint: 'receives notification emails' }
];

export default function UsersAdmin({ height = undefined as number | undefined }) {
  useLoadRoster(true);
  const roster = useRoster();
  const processData = useProcessData();
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

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: 3, height, overflowY: 'auto', bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 700 }}>
            Users & Roles
          </Typography>
          <Typography variant='body2' color='textSecondary'>
            Changes take effect immediately and are recorded with who made them. Role checks are enforced server-side
            {!WRITE_API_URL && ' (write API not configured — changes will not be permitted)'}.
          </Typography>
        </Box>
        <Button variant='contained' onClick={() => setAddOpen(true)}>
          Add User
        </Button>
      </Box>

      {error && (
        <Alert severity='error' onClose={() => setError(undefined)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} variant='outlined'>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              {ROLES.map(r => (
                <TableCell key={r.key} align='center' sx={{ fontWeight: 700 }} title={r.hint}>
                  {r.label}
                </TableCell>
              ))}
              <TableCell align='center' sx={{ fontWeight: 700 }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Last changed</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.email} sx={{ opacity: u.active === false ? 0.5 : 1 }}>
                <TableCell>
                  {u.email}
                  {u.email === myEmail && <Chip label='you' size='small' sx={{ ml: 1 }} />}
                </TableCell>
                {ROLES.map(r => (
                  <TableCell key={r.key} align='center'>
                    <Checkbox size='small' checked={(u.roles ?? []).includes(r.key)} disabled={u.active === false} onChange={() => toggleRole(u, r.key)} />
                  </TableCell>
                ))}
                <TableCell align='center'>
                  <Button size='small' color={u.active === false ? 'primary' : 'error'} onClick={() => toggleActive(u)}>
                    {u.active === false ? 'Reactivate' : 'Deactivate'}
                  </Button>
                </TableCell>
                <TableCell>
                  <Typography variant='caption' color='textSecondary'>
                    {u.updated ? new Date(u.updated).toLocaleDateString() : ''} {u.updatedBy ? `by ${u.updatedBy}` : ''}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color='textSecondary'>Roster is empty or still loading…</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label='Email address' value={newEmail} onChange={e => setNewEmail(e.target.value)} sx={{ mt: 1 }} />
          <Box sx={{ mt: 1 }}>
            {ROLES.map(r => (
              <FormControlLabel
                key={r.key}
                control={<Checkbox checked={newRoles.includes(r.key)} onChange={() => setNewRoles(prev => (prev.includes(r.key) ? prev.filter(x => x !== r.key) : [...prev, r.key]))} />}
                label={`${r.label} — ${r.hint}`}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant='contained' onClick={handleAdd}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
