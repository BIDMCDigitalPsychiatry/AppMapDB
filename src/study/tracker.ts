/*
 * Workflow Analytics tracker — records what a study participant does between
 * Start and Stop. A single module-level instance; components call
 * `track(type, data)` and it does nothing unless a trial is running, so the
 * instrumentation calls cost nothing for every other visitor.
 *
 * - The active run, the next sequence number and any unsent events are kept
 *   in localStorage, so the timer and the record survive page changes and
 *   reloads. A run left open (tab closed) shows as "abandoned" on the Admin
 *   page once it has been idle for a while; nothing is lost.
 * - Events go to the write API in batches: every few seconds, when the tab is
 *   hidden (with fetch keepalive so a closing tab still delivers), and in
 *   full at Stop / Cancel.
 * - Page-wide listeners (filter-tag hover times, scrolling time in the filter
 *   menu and app library) are installed only while a run is active.
 */
import { recordStudy, StudyEvent } from './api';
import type { StopAnswers } from './workflows';

const STORAGE_KEY = 'mindapps-study-run';
const FLUSH_INTERVAL_MS = 5000;
const MAX_BATCH = 200;
const HOVER_MIN_MS = 150; // shorter = the pointer just passing over
const SCROLL_IDLE_MS = 250; // a scroll "burst" ends after this much stillness
const USER_SCROLL_WINDOW_MS = 1000; // smooth scrolling keeps moving for a while after the last wheel tick

export interface ActiveRun {
  runId: string;
  email: string;
  workflowId: string;
  workflowLabel: string;
  started: number;
  language?: string;
  device?: string;
  stoppedAt?: number; // Stop pressed; the questions are still open
}

interface Persisted {
  run?: ActiveRun;
  seq: number;
  queue: StudyEvent[];
  lastApp?: string;
}

type Sender = (data: { run: Record<string, any>; events: StudyEvent[] }, keepalive: boolean) => Promise<any>;

const newRunId = () => {
  const bytes = new Uint8Array(12);
  globalThis.crypto.getRandomValues(bytes);
  return 'run_' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
};

const deviceType = () => {
  try {
    const w = window.innerWidth;
    return w < 600 ? 'phone' : w < 1024 ? 'tablet' : 'desktop';
  } catch {
    return undefined;
  }
};

export class StudyTracker {
  private state: Persisted = { seq: 0, queue: [] };
  private listeners = new Set<() => void>();
  private timer: any;
  private inflight: Promise<void> | undefined;
  private failures = 0;
  private filterSource: { source: string; until: number } | undefined;
  private detachDom: (() => void) | undefined;

  constructor(private send: Sender = recordStudy, private storage: Storage | undefined = typeof window !== 'undefined' ? window.localStorage : undefined) {
    this.load();
  }

  // ---- state + subscription (React reads this through useSyncExternalStore)
  private load() {
    try {
      const raw = this.storage?.getItem(STORAGE_KEY);
      if (raw) this.state = { seq: 0, queue: [], ...JSON.parse(raw) };
    } catch {
      /* storage blocked or corrupt — start clean */
    }
  }

  private save() {
    try {
      if (!this.state.run && this.state.queue.length === 0) this.storage?.removeItem(STORAGE_KEY);
      else this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      /* storage full/blocked — events still flush from memory */
    }
  }

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  private emit() {
    this.listeners.forEach(fn => fn());
  }

  getRun = (): ActiveRun | undefined => this.state.run;

  isActive = () => this.state.run !== undefined;

  // ---- lifecycle
  start(email: string, workflow: { id: string; label: string }, language?: string) {
    if (this.state.run) return this.state.run;
    const run: ActiveRun = {
      runId: newRunId(),
      email: email.toLowerCase(),
      workflowId: workflow.id,
      workflowLabel: workflow.label,
      started: Date.now(),
      language,
      device: deviceType()
    };
    this.state = { run, seq: 0, queue: this.state.queue, lastApp: undefined };
    this.track('run_start', { workflowId: workflow.id, language, viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : undefined });
    this.activate();
    this.flush();
    this.emit();
    return run;
  }

  /** Called once at page load: picks a persisted run back up for its owner, drops it for anyone else. */
  resume(email: string | undefined) {
    const run = this.state.run;
    if (!run) {
      if (this.state.queue.length) this.scheduleFlush();
      return;
    }
    if (!email || run.email !== email.toLowerCase()) return; // not signed in yet / someone else: leave it for its owner
    if (this.detachDom) return; // already running in this page
    this.track('run_resume');
    this.activate();
    this.emit();
  }

  /** Stop pressed: the trial's end time is now, even though the questions come next. */
  pressStop() {
    const run = this.state.run;
    if (!run || run.stoppedAt) return;
    this.endScrollBursts();
    this.track('run_stop_pressed');
    this.state.run = { ...run, stoppedAt: Date.now() };
    this.save();
    this.emit();
  }

  /** "Back to the task" from the questions: the clock keeps going. */
  undoStop() {
    const run = this.state.run;
    if (!run?.stoppedAt) return;
    this.track('run_stop_undone', { pausedMs: Date.now() - run.stoppedAt });
    this.state.run = { ...run, stoppedAt: undefined };
    this.save();
    this.emit();
  }

  lastAppName = () => this.state.lastApp;

  async stop(answers: StopAnswers) {
    return this.finish('completed', answers);
  }

  async cancel() {
    return this.finish('cancelled');
  }

  private async finish(status: 'completed' | 'cancelled', answers?: StopAnswers) {
    const run = this.state.run;
    if (!run) return;
    this.endScrollBursts();
    this.track(status === 'completed' ? 'run_stop' : 'run_cancel', answers ? { found: answers.found, ease: answers.ease } : undefined);
    const ended = run.stoppedAt ?? Date.now();
    this.deactivate();
    // Send everything still queued, then the final run row with the answers.
    await this.drain();
    let lastError: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const batch = this.state.queue.slice(0, MAX_BATCH);
        await this.send({ run: { ...this.runPayload(run), status, ended, answers }, events: batch }, false);
        const sent = new Set(batch.map(e => e.seq));
        this.state.queue = this.state.queue.filter(e => !sent.has(e.seq));
        lastError = undefined;
        break;
      } catch (err) {
        lastError = err;
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
      }
    }
    if (lastError) throw lastError; // the run stays persisted so the participant can press Stop again
    this.state = { seq: 0, queue: this.state.queue };
    this.save();
    this.emit();
  }

  private runPayload(run: ActiveRun) {
    const { email, stoppedAt, ...rest } = run; // the server takes the owner from the token
    return { ...rest, status: 'active', lastEventAt: Date.now() };
  }

  // ---- recording
  track(type: string, data?: Record<string, any>) {
    const run = this.state.run;
    if (!run) return;
    const t = Date.now();
    const clean = data ? Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) : undefined;
    this.state.queue.push({
      seq: this.state.seq++,
      type,
      t,
      elapsedMs: t - run.started,
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      data: clean && Object.keys(clean).length ? clean : undefined
    });
    if (type === 'app_open' && typeof clean?.name === 'string') this.state.lastApp = clean.name;
    this.save();
  }

  /**
   * Marks where the next filter changes come from (the assistant applying
   * its filters, the Clear / Reset buttons) so the check/uncheck events
   * carry it. Expires quickly; anything else counts as "manual".
   */
  markFilterSource(source: 'assistant' | 'clear' | 'reset', ms = 1500) {
    this.filterSource = { source, until: Date.now() + ms };
  }

  currentFilterSource() {
    return this.filterSource && this.filterSource.until > Date.now() ? this.filterSource.source : 'manual';
  }

  // ---- sending
  private scheduleFlush() {
    if (this.timer) return;
    const delay = Math.min(FLUSH_INTERVAL_MS * 2 ** this.failures, 60000);
    this.timer = setTimeout(() => {
      this.timer = undefined;
      this.flush();
    }, delay);
  }

  flush(keepalive = false): Promise<void> {
    // One request at a time; a flush asked for mid-send goes right after it.
    if (this.inflight) return this.inflight.then(() => (this.inflight ? this.inflight : this.flushOnce(keepalive)));
    return this.flushOnce(keepalive);
  }

  private flushOnce(keepalive: boolean): Promise<void> {
    const run = this.state.run;
    if (!run || this.state.queue.length === 0) {
      if (this.state.run) this.scheduleFlush();
      return Promise.resolve();
    }
    const batch = this.state.queue.slice(0, MAX_BATCH);
    this.inflight = this.send({ run: this.runPayload(run), events: batch }, keepalive)
      .then(() => {
        // Remove exactly what was sent (more may have been queued meanwhile).
        const sent = new Set(batch.map(e => e.seq));
        this.state.queue = this.state.queue.filter(e => !sent.has(e.seq));
        this.failures = 0;
        this.save();
      })
      .catch(err => {
        this.failures = Math.min(this.failures + 1, 4);
        console.warn('Study events not sent yet (will retry):', err?.message ?? err);
      })
      .finally(() => {
        this.inflight = undefined;
        if (this.state.run) this.scheduleFlush();
      });
    return this.inflight;
  }

  private async drain() {
    for (let i = 0; i < 20 && this.state.queue.length > MAX_BATCH; i++) {
      const before = this.state.queue.length;
      await this.flushIgnoringRun();
      if (this.state.queue.length >= before) break;
    }
  }

  private async flushIgnoringRun() {
    if (this.inflight) await this.inflight;
    const run = this.state.run;
    if (!run) return;
    const batch = this.state.queue.slice(0, MAX_BATCH);
    await this.send({ run: this.runPayload(run), events: batch }, false);
    const sent = new Set(batch.map(e => e.seq));
    this.state.queue = this.state.queue.filter(e => !sent.has(e.seq));
    this.save();
  }

  // ---- page-wide listeners (active runs only)
  private activate() {
    this.scheduleFlush();
    if (typeof document === 'undefined' || this.detachDom) return;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        this.endScrollBursts();
        this.flush(true);
      }
    };
    const hover = this.hoverHandlers();
    const onScroll = this.scrollHandler();
    // Only scrolling the person does counts: wheel / touch / keys, or a held
    // pointer (dragging a scrollbar). Layout jumps (e.g. the filter menu
    // re-flowing after "Reset all filters") and code-driven scrolls don't.
    const onInput = () => (this.lastUserInput = Date.now());
    const onKey = (e: KeyboardEvent) => ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key) && onInput();
    const onDown = () => (this.pointerHeld = true);
    const onUp = () => (this.pointerHeld = false);
    const passive = { capture: true, passive: true } as AddEventListenerOptions;
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('pointerover', hover.over, true);
    document.addEventListener('pointerout', hover.out, true);
    document.addEventListener('scroll', onScroll, passive);
    document.addEventListener('wheel', onInput, passive);
    document.addEventListener('touchmove', onInput, passive);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('pointerup', onUp, true);
    this.detachDom = () => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('pointerover', hover.over, true);
      document.removeEventListener('pointerout', hover.out, true);
      document.removeEventListener('scroll', onScroll, passive);
      document.removeEventListener('wheel', onInput, passive);
      document.removeEventListener('touchmove', onInput, passive);
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('pointerup', onUp, true);
    };
  }

  private deactivate() {
    this.detachDom?.();
    this.detachDom = undefined;
    clearTimeout(this.timer);
    this.timer = undefined;
  }

  // Filter tags carry data-study-filter="<category>|<value>" (MultiSelectCheckExpandable).
  private hoverHandlers() {
    let current: { el: Element; since: number } | undefined;
    const end = () => {
      if (!current) return;
      const durationMs = Date.now() - current.since;
      const [category, value] = (current.el.getAttribute('data-study-filter') ?? '').split('|');
      const checked = current.el.querySelector('input[type=checkbox]') as HTMLInputElement | null;
      if (durationMs >= HOVER_MIN_MS) this.track('filter_hover', { category, value, durationMs, checked: checked?.checked });
      current = undefined;
    };
    return {
      over: (e: Event) => {
        const el = (e.target as Element)?.closest?.('[data-study-filter]');
        if (!el || current?.el === el) return;
        end();
        current = { el, since: Date.now() };
      },
      out: (e: PointerEvent) => {
        if (!current) return;
        const to = e.relatedTarget as Node | null;
        if (to && current.el.contains(to)) return;
        end();
      }
    };
  }

  // Tagged areas win (data-study-scroll="filters" on the filter menu,
  // "assistant" on the chat). Otherwise, on the library page any scrolling in
  // the main content is the app library — the grid, the table view and the
  // page itself each scroll a different element, so they're not tagged one by
  // one. Elsewhere it's "page".
  private bursts = new Map<string, { start: number; last: number; timer: any; el: Element }>();
  private lastUserInput = 0;
  private pointerHeld = false;

  private scrollArea(target: EventTarget | null): { area: string; el: Element } | undefined {
    const el = target instanceof Element ? target : (target as Document)?.scrollingElement ?? undefined;
    if (!el) return undefined;
    const tagged = el.closest?.('[data-study-scroll]');
    if (tagged) return { area: tagged.getAttribute('data-study-scroll')!, el };
    const inContent = el === document.scrollingElement || el.id === 'app-content' || el.closest?.('#app-content') !== null;
    if (!inContent) return undefined; // dialogs, menus
    return { area: /\/Apps\/?$/.test(window.location.pathname) ? 'library' : 'page', el };
  }

  private scrollHandler() {
    return (e: Event) => {
      const now = Date.now();
      if (!this.pointerHeld && now - this.lastUserInput > USER_SCROLL_WINDOW_MS) return;
      const hit = this.scrollArea(e.target);
      if (!hit) return;
      const b = this.bursts.get(hit.area);
      if (b) {
        b.last = now;
        clearTimeout(b.timer);
        b.timer = setTimeout(() => this.endBurst(hit.area), SCROLL_IDLE_MS);
      } else {
        this.bursts.set(hit.area, { start: now, last: now, el: hit.el, timer: setTimeout(() => this.endBurst(hit.area), SCROLL_IDLE_MS) });
      }
    };
  }

  private endBurst(area: string) {
    const b = this.bursts.get(area);
    if (!b) return;
    clearTimeout(b.timer);
    this.bursts.delete(area);
    // A single wheel notch still takes a frame or so; count at least 50 ms.
    // scrollTop = where they ended up (how far down the list they got).
    this.track('scroll', { area, durationMs: Math.max(50, b.last - b.start), scrollTop: Math.round(b.el.scrollTop) });
  }

  private endScrollBursts() {
    Array.from(this.bursts.keys()).forEach(a => this.endBurst(a));
  }

  /** Test helper: queued (unsent) events. */
  pending() {
    return [...this.state.queue];
  }
}

export const studyTracker = new StudyTracker();

// Shorthand for the instrumentation points across the site.
export const trackStudy = (type: string, data?: Record<string, any>) => studyTracker.track(type, data);

/**
 * Wraps a "clear all filters" / "Reset all filters" handler so the study can
 * tell the two apart (and label the unchecks that follow). A no-op wrapper
 * for everyone who isn't in a trial.
 */
export const withStudyFilterAction =
  (kind: 'clear' | 'reset', where: string, handler: () => void) =>
  (..._args: any[]) => {
    if (studyTracker.isActive()) {
      studyTracker.markFilterSource(kind);
      studyTracker.track(kind === 'clear' ? 'filter_clear' : 'filter_reset', { scope: 'all', where });
    }
    handler();
  };
