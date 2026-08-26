/*
 * Client for the write API's registered-users report (Admin > Users > "View
 * All Registered Users"). Super Admin only — the Lambda verifies the caller's
 * token and roster role server-side; this helper just attaches the session.
 * Read-only: no user actions are exposed through this route.
 */
import { Auth } from 'aws-amplify';
import { WRITE_API_URL } from './useProcessData';

export interface RegisteredUser {
  email: string;
  emailVerified: boolean;
  status: string; // Cognito UserStatus, e.g. CONFIRMED / UNCONFIRMED
  enabled: boolean;
  created?: number;
  // Rating activity from the email-index (absent when statsSkipped)
  ratings?: number;
  firstActivity?: number;
  lastActivity?: number;
}

export const listRegisteredUsers = async (): Promise<{ users: RegisteredUser[]; statsSkipped: boolean }> => {
  if (!WRITE_API_URL) throw new Error('Write API not configured');
  const session = await Auth.currentSession();
  const res = await fetch(WRITE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.getIdToken().getJwtToken()}` },
    body: JSON.stringify({ listRegisteredUsers: true })
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || json.ok !== true) throw new Error(json?.error ?? `Request failed (${res.status})`);
  return { users: json.users ?? [], statsSkipped: json.statsSkipped === true };
};
