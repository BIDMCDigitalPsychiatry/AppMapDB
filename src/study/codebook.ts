/*
 * Codebook: brief operational definitions of every variable in Study
 * Analytics (the dashboard and the three CSV exports). Shown in the
 * dashboard's Codebook dialog and downloadable as CSV. English only — it is
 * reference material for the research team, not interface text.
 *
 * Keep this in step with src/study/report.ts (CSV columns),
 * cloud_functions/mindapps-write-api/study.js (summarizeRun, event types) and
 * src/study/tracker.ts (what is recorded and when).
 */

export interface CodebookEntry {
  section: string;
  name: string;
  definition: string;
}

const RUNS = 'Runs CSV (one row per trial)';
const EVENTS = 'Events CSV (one row per recorded action)';
const EVENT_TYPES = 'Event types (the "event" column of the Events CSV)';
const TRANSCRIPTS = 'Assistant transcripts CSV (one row per chat message)';
const TERMS = 'General terms';

export const CODEBOOK: CodebookEntry[] = [
  // ---- General
  { section: TERMS, name: 'Trial / run', definition: 'One attempt at one task by one participant account, from pressing Start to pressing Stop (or Cancel). An account can do many trials.' },
  {
    section: TERMS,
    name: 'Start',
    definition:
      'When the participant picks a task and presses Start, the site first resets (app library page, all filters and search cleared, filter panel / assistant opened or minimized to suit the task). The trial clock starts only after that reset, so the reset itself is never recorded.'
  },
  {
    section: TERMS,
    name: 'Stop',
    definition:
      'The trial ends at the moment Stop is pressed; the time spent answering the question afterwards is not counted. If the participant goes "Back to the task", the trial continues and ends at the next Stop.'
  },
  {
    section: TERMS,
    name: 'Status',
    definition:
      'completed = Stop pressed and the question answered. cancelled = Cancel trial pressed (no question asked). in progress = still running. abandoned = no activity for 30 minutes without Stop or Cancel (e.g. tab closed); abandoned runs are excluded from the timing figures.'
  },
  { section: TERMS, name: 'Timestamps', definition: 'All times in the CSVs are UTC (ISO 8601). The dashboard shows them in your local time zone.' },
  { section: TERMS, name: 'Durations (_s)', definition: 'Seconds, to one decimal place. The dashboard shows m:ss.' },
  {
    section: TERMS,
    name: 'Retired questions',
    definition:
      'Trials before mid-November 2026 also asked a 1–7 ease rating and an optional suggestions box. Those answers are kept for old runs (ease_1_7, suggestions columns; "Ease" on the dashboard) and are empty for newer runs.'
  },

  // ---- Runs CSV
  { section: RUNS, name: 'run_id', definition: 'Unique id of the trial. Links the Runs, Events and Transcripts CSVs.' },
  { section: RUNS, name: 'account', definition: 'The participant account (study login) that did the trial.' },
  { section: RUNS, name: 'task_id', definition: 'Stable id of the task (filters-only, assistant-only; older trials may show retired tasks).' },
  { section: RUNS, name: 'task', definition: 'Task name as it was shown when the trial ran.' },
  { section: RUNS, name: 'status', definition: 'completed, cancelled, abandoned or in progress (see Status).' },
  { section: RUNS, name: 'started_utc', definition: 'When the trial started (after the reset).' },
  { section: RUNS, name: 'stopped_utc', definition: 'When Stop (or Cancel) was pressed. Empty while in progress / abandoned.' },
  { section: RUNS, name: 'duration_s', definition: 'Time from Start to Stop. For runs without Stop, time to the last recorded action.' },
  { section: RUNS, name: 'language', definition: 'Site language when the trial started (en, fr, de).' },
  { section: RUNS, name: 'device', definition: 'phone (window narrower than 600 px), tablet (600–1023 px) or desktop (1024 px or wider), from the browser window width at Start.' },
  { section: RUNS, name: 'found', definition: 'Answer to "Did you find an app that fits the task?": yes, partly or no.' },
  { section: RUNS, name: 'app_chosen', definition: 'The app the participant named (pre-filled with the last app page they opened; they can change it). Empty when found = no.' },
  { section: RUNS, name: 'ease_1_7', definition: 'Retired. Single Ease Question, 1 = very difficult, 7 = very easy. Old runs only.' },
  { section: RUNS, name: 'suggestions', definition: 'Retired. Free-text suggestions. Old runs only.' },
  { section: RUNS, name: 'notes', definition: 'Notes typed by the study team on the dashboard (not seen by participants).' },
  { section: RUNS, name: 'time_to_first_action_s', definition: 'Time from Start to the first filter check, assistant message or search-box entry, whichever came first.' },
  { section: RUNS, name: 'time_to_first_app_s', definition: 'Time from Start to the first app page opened.' },
  { section: RUNS, name: 'assistant_turns', definition: 'Number of message → reply exchanges with the AI search assistant.' },
  { section: RUNS, name: 'assistant_typing_s', definition: 'Total time spent typing assistant messages (from the first keystroke of a message to sending it).' },
  { section: RUNS, name: 'assistant_wait_s', definition: 'Total time spent waiting for assistant replies (send → reply shown).' },
  { section: RUNS, name: 'assistant_final_tags', definition: 'The filter tags applied by the last assistant reply that applied filters.' },
  {
    section: RUNS,
    name: 'assistant_transcript',
    definition:
      'The whole AI search assistant conversation of the trial in one cell, one message per line in order: "Participant: …" or "AI search assistant: …". "[New chat]" marks the participant starting over; "(no reply: …)" means the assistant could not be reached. Empty if the assistant was not used. The Assistant transcripts CSV has the same messages one per row, with times.'
  },
  { section: RUNS, name: 'filter_checks', definition: 'Number of filter tags turned on, by any means (checkbox, assistant, chips).' },
  { section: RUNS, name: 'filter_checks_by_assistant', definition: 'The part of filter_checks that the AI search assistant applied.' },
  { section: RUNS, name: 'filter_unchecks', definition: 'Number of filter tags turned off, by any means.' },
  { section: RUNS, name: 'filter_hovers', definition: 'Number of times the pointer rested on a filter tag for at least 0.15 s (shorter passes are ignored). Desktop only.' },
  { section: RUNS, name: 'filter_hover_s', definition: 'Total time spent resting the pointer on filter tags.' },
  { section: RUNS, name: 'filter_clears', definition: 'Number of times "Clear" was pressed in the filter menu (all filters, or one group).' },
  { section: RUNS, name: 'filter_resets', definition: 'Number of times "Reset all filters" was pressed (filter buttons or the no-results message).' },
  { section: RUNS, name: 'filter_group_toggles', definition: 'Number of times a filter group (e.g. Conditions) was expanded or collapsed.' },
  { section: RUNS, name: 'filter_panel_toggles', definition: 'Number of times the whole left filter panel was opened or minimized.' },
  {
    section: RUNS,
    name: 'scroll_filters_s',
    definition: 'Total time spent scrolling the filter menu. A scroll ends after 0.25 s of stillness; only scrolling the participant did (not automatic scrolling) counts.'
  },
  { section: RUNS, name: 'scroll_library_s', definition: 'Total time spent scrolling the app library (results), measured the same way.' },
  { section: RUNS, name: 'app_opens', definition: 'Number of app pages opened.' },
  { section: RUNS, name: 'app_card_expands', definition: 'Number of times an app card in the library was expanded to show more.' },
  { section: RUNS, name: 'events', definition: 'Total number of recorded actions in the trial (rows in the Events CSV).' },

  // ---- Events CSV
  { section: EVENTS, name: 'run_id, account, task_id', definition: 'As in the Runs CSV.' },
  { section: EVENTS, name: 'seq', definition: 'Order of the action within the trial (0, 1, 2 …).' },
  { section: EVENTS, name: 'time_utc', definition: 'When the action happened.' },
  { section: EVENTS, name: 'elapsed_s', definition: 'Seconds since the trial started.' },
  { section: EVENTS, name: 'event', definition: 'What happened (see Event types).' },
  { section: EVENTS, name: 'page', definition: 'The site page the participant was on (e.g. /Apps for the app library).' },
  { section: EVENTS, name: 'category, value', definition: 'For filter events: the filter group (e.g. Conditions) and tag (e.g. Sleep).' },
  {
    section: EVENTS,
    name: 'source',
    definition: 'For filter checks/unchecks: manual (the participant clicked), assistant (applied by the AI search assistant), clear or reset (caused by those buttons).'
  },
  { section: EVENTS, name: 'duration_ms', definition: 'For hovers and scrolls: how long it lasted, in milliseconds.' },
  { section: EVENTS, name: 'text', definition: 'For assistant messages/replies and the search box: the text typed or shown.' },
  { section: EVENTS, name: 'details', definition: 'Any other recorded values for the action, as JSON (e.g. turn number, typing time, reply wait, number of active filters).' },

  // ---- Event types
  { section: EVENT_TYPES, name: 'run_start', definition: 'Trial started (details: language, screen size).' },
  { section: EVENT_TYPES, name: 'run_stop_pressed', definition: 'Stop pressed; the question is shown.' },
  { section: EVENT_TYPES, name: 'run_stop_undone', definition: '"Back to the task" pressed on the question; the trial continues.' },
  { section: EVENT_TYPES, name: 'run_stop', definition: 'Question answered; trial completed.' },
  { section: EVENT_TYPES, name: 'run_cancel', definition: 'Cancel trial pressed.' },
  { section: EVENT_TYPES, name: 'run_resume', definition: 'The page was reloaded or reopened during a trial and recording picked up again.' },
  { section: EVENT_TYPES, name: 'page_view', definition: 'A site page was shown.' },
  { section: EVENT_TYPES, name: 'filter_check / filter_uncheck', definition: 'A filter tag was turned on / off.' },
  { section: EVENT_TYPES, name: 'filter_hover', definition: 'The pointer rested on a filter tag (≥ 0.15 s).' },
  { section: EVENT_TYPES, name: 'filter_clear / filter_reset', definition: '"Clear" / "Reset all filters" pressed.' },
  { section: EVENT_TYPES, name: 'filter_group_expand / filter_group_collapse', definition: 'A filter group was opened / closed.' },
  { section: EVENT_TYPES, name: 'filter_panel_open / filter_panel_close', definition: 'The left filter panel was opened / minimized.' },
  { section: EVENT_TYPES, name: 'search_text', definition: 'Text typed in the search box (recorded once typing pauses for 1 s).' },
  { section: EVENT_TYPES, name: 'scroll', definition: 'A scroll of the filter menu or app library ended (details: area, how far down).' },
  { section: EVENT_TYPES, name: 'app_open', definition: 'An app page was opened (details: app name, where it was opened from).' },
  { section: EVENT_TYPES, name: 'app_card_expand / app_card_collapse', definition: 'An app card in the library was expanded / collapsed.' },
  { section: EVENT_TYPES, name: 'assistant_open / assistant_close', definition: 'The AI search assistant panel was opened / closed.' },
  { section: EVENT_TYPES, name: 'assistant_consent', definition: 'The participant accepted the assistant’s privacy notice (first use only).' },
  { section: EVENT_TYPES, name: 'assistant_message', definition: 'The participant sent a message to the assistant (details: turn, words, typing time).' },
  { section: EVENT_TYPES, name: 'assistant_reply', definition: 'The assistant replied (details: turn, wait time, reply type, filters applied).' },
  { section: EVENT_TYPES, name: 'assistant_new_chat', definition: 'New chat pressed in the assistant.' },
  { section: EVENT_TYPES, name: 'language_change', definition: 'The site language was changed.' },

  // ---- Transcripts CSV
  { section: TRANSCRIPTS, name: 'run_id, account, task_id, task', definition: 'As in the Runs CSV.' },
  { section: TRANSCRIPTS, name: 'turn', definition: 'Exchange number within the chat (message 1 and its reply share turn 1).' },
  { section: TRANSCRIPTS, name: 'time_utc, elapsed_s', definition: 'When the message was sent / the reply arrived, and seconds since the trial started.' },
  { section: TRANSCRIPTS, name: 'speaker', definition: 'Participant or AI search assistant. "—" marks New chat being pressed.' },
  { section: TRANSCRIPTS, name: 'message', definition: 'The full text of the message. "(no reply: …)" means the assistant could not be reached.' },
  {
    section: TRANSCRIPTS,
    name: 'reply_type',
    definition: 'For assistant replies: filters (a search), crisis (crisis resources shown), bad_request / error / network_error (failed).'
  },
  { section: TRANSCRIPTS, name: 'reply_wait_s', definition: 'For assistant replies: seconds between sending the message and the reply.' },
  { section: TRANSCRIPTS, name: 'filters_applied', definition: 'For assistant replies: the filter tags the reply applied to the library.' },

  // ---- Dashboard-only figures
  { section: 'Dashboard: By task', name: 'Runs', definition: 'Number of trials of the task (within the current filters).' },
  { section: 'Dashboard: By task', name: 'Completed', definition: 'Completed trials, and their share of finished trials (completed + cancelled + abandoned).' },
  { section: 'Dashboard: By task', name: 'Median / Mean time', definition: 'Of duration, completed trials only.' },
  { section: 'Dashboard: By task', name: 'To first app', definition: 'Median time to the first app page opened, completed trials only.' },
  { section: 'Dashboard: By task', name: 'Found it', definition: 'Share of completed trials answering "yes".' },
  { section: 'Dashboard: By task', name: 'Ease (1–7)', definition: 'Retired. Mean ease rating of old runs.' },
  { section: 'Dashboard: By task', name: 'Assistant turns / wait', definition: 'Mean assistant turns per completed trial (trials with no chat count as 0); mean of each trial’s average wait per assistant reply (trials with no chat left out).' },
  { section: 'Dashboard: By task', name: 'Filter checks / Unchecks / Hovers / Scroll / Apps opened', definition: 'Means per completed trial of the Runs CSV columns of the same name.' }
];

export const CODEBOOK_SECTIONS = Array.from(new Set(CODEBOOK.map(e => e.section)));
