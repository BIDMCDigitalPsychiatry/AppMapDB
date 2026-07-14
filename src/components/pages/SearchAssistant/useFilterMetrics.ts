import * as React from 'react';
import { useTableFilterValues } from '../../application/GenericTable/store';
import { getAssistantClientId } from './clientId';
import { ASSISTANT_ENDPOINT, assistantEnabled } from './config';

const DEBOUNCE_MS = 2500;

/**
 * Records manual filter-drawer usage so the assistant can be measured against
 * the way people already search (see cloud_functions/mind-search-assistant/
 * metrics.js). Without this control group there's no way to tell whether the
 * assistant actually helps anyone.
 *
 * Records CATEGORY NAMES ONLY — that "Conditions" was used, never that the
 * value was "Self-Harm". No message text, no filter values.
 *
 * Debounced: ticking four checkboxes is one settled search, not four events.
 * Fire-and-forget — a failed analytics call must never affect the page.
 */
export default function useFilterMetrics(resultCount: number) {
  const [filters] = useTableFilterValues('Applications');
  const timer = React.useRef<any>(null);
  const lastSent = React.useRef<string>('');

  // Keep the latest result count without making it a dependency: it changes as
  // the table recomputes, and we don't want that to restart the debounce.
  const resultCountRef = React.useRef(resultCount);
  resultCountRef.current = resultCount;

  const key = JSON.stringify(
    Object.entries(filters || {})
      .filter(([, v]) => Array.isArray(v) && v.length > 0)
      .map(([k, v]) => [k, (v as string[]).length])
      .sort()
  );

  React.useEffect(() => {
    if (!assistantEnabled) return; // no endpoint configured — nothing to post to
    if (key === '[]' || key === lastSent.current) return; // no active filters, or nothing changed

    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      lastSent.current = key;
      fetch(ASSISTANT_ENDPOINT.replace(/\/chat$/, '/event'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters, // server keeps category names only
          resultCount: resultCountRef.current,
          clientId: getAssistantClientId()
        }),
        keepalive: true
      }).catch(() => {
        /* analytics must never break the page */
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer.current);
  }, [key, filters]);
}
