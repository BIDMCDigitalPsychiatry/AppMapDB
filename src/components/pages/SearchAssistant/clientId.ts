const STORAGE_KEY = 'mindapps-assistant-client-id';

const randomId = (): string =>
  typeof crypto !== 'undefined' && (crypto as any).randomUUID
    ? (crypto as any).randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

/**
 * A fresh id for each conversation (reset by the New chat button). Groups the
 * counts-only usage metrics into conversations — how many messages per chat —
 * without any link to message content, which is never stored.
 */
export const newConversationId = (): string => randomId();

/**
 * A stable, pseudonymous per-browser id for the search assistant, sent to the
 * backend and forwarded to Anthropic as `metadata.user_id`. That gives their
 * abuse tooling a per-visitor handle, so enforcement against one abusive user
 * is scoped to that user rather than to our whole API key / organization.
 *
 * Deliberately a RANDOM value, not a device fingerprint and not anything
 * derived from the user: it identifies a browser to us and to nobody else,
 * carries no personal information, and is thrown away when the user clears
 * their site data. The server hashes it again before it ever leaves our
 * infrastructure.
 */
export function getAssistantClientId(): string | undefined {
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const id = randomId();
    window.localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    // Private mode / storage disabled — the assistant still works, we just
    // can't offer a stable id for that visitor.
    return undefined;
  }
}
