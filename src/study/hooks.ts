import * as React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { studyTracker } from './tracker';
import { useSignedIn } from '../hooks';
import { useLoadRoster, useRosterRole } from '../database/useUsers';
import { useTableFilterValues, useTableSearchText } from '../components/application/GenericTable/store';
import { useLeftDrawer } from '../components/layout/store';
import { useCurrentLanguage } from '../i18n';

export const useUserEmailRaw = (): string => useSelector((s: any) => s.layout.user?.signInUserSession?.idToken?.payload?.email ?? '');

// Study participants: accounts with the `analytics` roster role. UI hint
// only — the write API re-checks the role on every recorded batch.
export const useIsAnalyticsUser = () => {
  const signedIn = useSignedIn();
  const email = useUserEmailRaw();
  useLoadRoster(signedIn);
  const hasRole = useRosterRole(email, 'analytics');
  return signedIn && hasRole === true;
};

export const useStudyRun = () => React.useSyncExternalStore(studyTracker.subscribe, studyTracker.getRun, studyTracker.getRun);

export const useStudyActive = () => useStudyRun() !== undefined;

type Filters = Record<string, string[]>;

// Per-tag check / uncheck events from the shared filter state, so every way of
// changing a filter is covered (checkbox, assistant, Clear, Reset, chips).
export const diffFilters = (prev: Filters, next: Filters) => {
  const checked: { category: string; value: string }[] = [];
  const unchecked: { category: string; value: string }[] = [];
  const cats = new Set([...Object.keys(prev ?? {}), ...Object.keys(next ?? {})]);
  cats.forEach(category => {
    const a = new Set(prev?.[category] ?? []);
    const b = new Set(next?.[category] ?? []);
    b.forEach(value => !a.has(value) && checked.push({ category, value }));
    a.forEach(value => !b.has(value) && unchecked.push({ category, value }));
  });
  return { checked, unchecked };
};

/**
 * Mounted once (inside StudyPanel) while an analytics user is signed in:
 * resumes a persisted run, and turns app-wide state changes into events.
 */
export const useStudyObservers = (active: boolean) => {
  const email = useUserEmailRaw();
  React.useEffect(() => {
    studyTracker.resume(email || undefined);
  }, [email]);

  const [filters] = useTableFilterValues('Applications');
  const prevFilters = React.useRef<Filters>(filters);
  React.useEffect(() => {
    const prev = prevFilters.current;
    prevFilters.current = filters;
    if (!active || prev === filters) return;
    const { checked, unchecked } = diffFilters(prev, filters);
    const source = studyTracker.currentFilterSource();
    const total = Object.values(filters ?? {}).reduce((n, v: any) => n + (v?.length ?? 0), 0);
    checked.forEach(f => studyTracker.track('filter_check', { ...f, source, activeFilters: total }));
    unchecked.forEach(f => studyTracker.track('filter_uncheck', { ...f, source, activeFilters: total }));
  }, [filters, active]);

  // The search box, recorded once typing pauses for a second.
  const [searchText] = useTableSearchText('Applications');
  const lastSearch = React.useRef((searchText ?? '').trim());
  React.useEffect(() => {
    const text = (searchText ?? '').trim();
    if (!active || text === lastSearch.current) return;
    const timer = setTimeout(() => {
      lastSearch.current = text;
      studyTracker.track('search_text', { text, chars: text.length });
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchText, active]);

  const [drawerOpen, , drawerEnabled] = useLeftDrawer();
  const prevDrawer = React.useRef(drawerOpen);
  React.useEffect(() => {
    const prev = prevDrawer.current;
    prevDrawer.current = drawerOpen;
    if (!active || !drawerEnabled || prev === drawerOpen) return;
    studyTracker.track(drawerOpen ? 'filter_panel_open' : 'filter_panel_close');
  }, [drawerOpen, drawerEnabled, active]);

  const lang = useCurrentLanguage();
  const prevLang = React.useRef(lang);
  React.useEffect(() => {
    const prev = prevLang.current;
    prevLang.current = lang;
    if (active && prev !== lang) studyTracker.track('language_change', { from: prev, to: lang });
  }, [lang, active]);

  const { pathname } = useLocation();
  React.useEffect(() => {
    if (active) studyTracker.track('page_view', { page: pathname });
  }, [pathname, active]);
};
