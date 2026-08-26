/*
 * Client for the write API's server-side email operations (the five browser
 * SES flows moved behind the Lambda — PLAN_MODERNIZATION.md §1). The client
 * sends only structured fields; templates, recipients (roster roles), and
 * the From address are owned server-side. Three types are anonymous (public
 * forms); surveyFollowUp attaches the admin's session token.
 */
import { Auth } from 'aws-amplify';
import { WRITE_API_URL } from './useProcessData';

export type ApiEmailType = 'surveyConfirmation' | 'surveyStaffNotice' | 'surveyFollowUp' | 'ratingInterest' | 'suggestEdit';

export const sendApiEmail = async (type: ApiEmailType, data: Record<string, any>): Promise<boolean> => {
  if (!WRITE_API_URL) {
    console.error(`Write API not configured — '${type}' email not sent.`);
    return false;
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const session = await Auth.currentSession();
    headers.Authorization = `Bearer ${session.getIdToken().getJwtToken()}`;
  } catch {
    // not signed in — fine for the anonymous email types
  }
  try {
    const res = await fetch(WRITE_API_URL, { method: 'POST', headers, body: JSON.stringify({ email: { type, data } }) });
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok || json.ok !== true) {
      console.error(`'${type}' email failed:`, json?.error ?? res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`'${type}' email failed:`, err);
    return false;
  }
};
