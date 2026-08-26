/*
 * Expired-session handling (PLAN_MODERNIZATION.md §1 follow-up).
 *
 * Amplify's refresh token lasts ~30 days, but redux-persist remembers the
 * signed-in user indefinitely — the legacy direct-write path never needed a
 * token, so a dead session used to go unnoticed while the UI still looked
 * signed in. The write API surfaced that: token fetches throw "No current
 * user" and requests 401. When that happens, sync the UI to reality: clear
 * the persisted user and tell the user to sign back in.
 */
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Auth } from 'aws-amplify';
import { updateSnackBar } from '../components/application/SnackBar/store';

export const SESSION_EXPIRED_MESSAGE = 'Your session has expired — please sign in again.';

// Thunk: sign the UI out (same SET_USER action the logout menu uses) and
// explain why. Safe to dispatch repeatedly.
export const sessionExpired = () => (dispatch, getState) => {
  if (getState()?.layout?.user !== undefined) dispatch({ type: 'SET_USER', user: undefined });
  dispatch(updateSnackBar({ open: true, variant: 'error', message: SESSION_EXPIRED_MESSAGE }));
};

export const isNoCurrentUserError = err => String((err && err.message) || err).includes('No current user');

// Load-time check: if the persisted state claims a signed-in user, confirm
// Amplify actually holds a live session (currentSession refreshes the tokens
// itself when the refresh token is still valid). If not, sign the UI out so
// admin controls never show for a dead session.
export const useSessionCheck = () => {
  const dispatch = useDispatch();
  const signedIn = useSelector((s: any) => s.layout.user !== undefined);
  const checked = React.useRef(false);
  React.useEffect(() => {
    if (!signedIn || checked.current) return;
    checked.current = true;
    Auth.currentSession().catch(() => dispatch(sessionExpired() as any));
  }, [signedIn, dispatch]);
};
