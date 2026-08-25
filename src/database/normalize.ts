/*
 * Emails must be stored lowercase: the email-index GSI keys on the raw field
 * and DynamoDB keys are case-sensitive, while every comparison in the app has
 * always been case-insensitive. Cognito tokens carry whatever casing the user
 * typed at registration, so writes normalize through here (called from
 * useProcessData — the single point every save flows through). Existing rows
 * are handled by scripts/db-migration/01_migrate_emails.js.
 */
export const normalizeEmailFields = <T extends { email?: any; approverEmail?: any }>(data: T): T => {
  const out = { ...data };
  for (const field of ['email', 'approverEmail'] as const) {
    if (typeof out[field] === 'string') (out as any)[field] = (out[field] as string).toLowerCase();
  }
  return out;
};
