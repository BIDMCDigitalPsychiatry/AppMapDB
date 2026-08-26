import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useProcessData } from '../../../../database/useProcessData';
import { useRoster, RosterUser } from '../../../../database/useUsers';
import { updateSnackBar } from '../../SnackBar/store';

/*
 * Shared actions for the Users roster table (PLAN_MODERNIZATION.md §2).
 * Guardrail violations and server rejections surface via the snackbar; the
 * write API re-enforces everything server-side (Super Admin only).
 */
export const useRosterActions = () => {
  const roster = useRoster();
  const processData = useProcessData();
  const dispatch = useDispatch();
  const myEmail = String(useSelector((s: any) => s.layout.user?.signInUserSession?.idToken?.payload?.email ?? '')).toLowerCase();

  const users = React.useMemo(() => (Object.values(roster) as RosterUser[]).filter(u => u && u.email), [roster]);
  const activeCount = React.useCallback((role: string) => users.filter(u => u.active !== false && (u.roles ?? []).includes(role)).length, [users]);

  const fail = React.useCallback((message: string) => dispatch(updateSnackBar({ open: true, variant: 'error', message })), [dispatch]);

  const save = React.useCallback(
    (user: RosterUser, action: 'u' | 'd' = 'u') => {
      const email = user.email.toLowerCase();
      processData({
        Model: 'users',
        Action: action,
        // The roster store (and users table) key by email, so _id = email.
        Data: { ...user, email, _id: email },
        onError: (response: any) => fail(response?.error ?? 'Update failed')
      });
    },
    [processData, fail]
  );

  const toggleRole = React.useCallback(
    (user: RosterUser, role: string) => {
      const has = (user.roles ?? []).includes(role);
      if (role === 'superadmin' && has && user.email === myEmail) return fail('You cannot remove your own Super Admin role');
      if (role === 'superadmin' && has && activeCount('superadmin') <= 1) return fail('Cannot remove the last active Super Admin');
      if (role === 'admin' && has && user.email === myEmail) return fail('You cannot remove your own admin role');
      if (role === 'admin' && has && activeCount('admin') <= 1) return fail('Cannot remove the last active admin');
      save({ ...user, roles: has ? (user.roles ?? []).filter(r => r !== role) : [...(user.roles ?? []), role] });
    },
    [myEmail, activeCount, save, fail]
  );

  const toggleActive = React.useCallback(
    (user: RosterUser) => {
      const deactivating = user.active !== false;
      if (deactivating && user.email === myEmail) return fail('You cannot deactivate your own account');
      if (deactivating && (user.roles ?? []).includes('superadmin') && activeCount('superadmin') <= 1) return fail('Cannot deactivate the last active Super Admin');
      if (deactivating && (user.roles ?? []).includes('admin') && activeCount('admin') <= 1) return fail('Cannot deactivate the last active admin');
      save({ ...user, active: deactivating ? false : true });
    },
    [myEmail, activeCount, save, fail]
  );

  const deleteUser = React.useCallback(
    (user: RosterUser) => {
      if (user.email === myEmail) return fail('You cannot delete your own account');
      if (user.active !== false && (user.roles ?? []).includes('superadmin') && activeCount('superadmin') <= 1) return fail('Cannot delete the last active Super Admin');
      if (user.active !== false && (user.roles ?? []).includes('admin') && activeCount('admin') <= 1) return fail('Cannot delete the last active admin');
      save(user, 'd');
    },
    [myEmail, activeCount, save, fail]
  );

  const addUser = React.useCallback(
    (email: string, roles: string[]) => save({ email, roles, active: true }),
    [save]
  );

  return { users, myEmail, roster, toggleRole, toggleActive, deleteUser, addUser, fail };
};
