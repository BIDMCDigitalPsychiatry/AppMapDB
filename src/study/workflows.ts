/*
 * The tasks a study participant can pick when they press Start, and the
 * question asked after Stop. Kept as a fixed list in code: changing a task
 * is a one-line edit + deploy. Each run stores the task's id AND its English
 * label, so renaming a task later never mislabels old runs.
 *
 * The study team asked (2026-11) to keep only these two tasks. Runs of the
 * removed tasks (open-ended, known-app, comparison, free) keep their stored
 * labels, so they still show in Study Analytics.
 */
import { tx } from '../i18n';

// How the page is set up when a trial starts (before the timer begins, so none
// of it is recorded): the filter panel and the search assistant are opened or
// minimized to match the task.
export interface StudyWorkflowSetup {
  filters: 'open' | 'closed';
  assistant: 'open' | 'closed';
}

export interface StudyWorkflow {
  id: string;
  label: string;
  task: string;
  emphasis: string; // the part of `task` shown underlined (must appear in it, also in translations)
  setup: StudyWorkflowSetup;
}

// Ids are stable (stored on every run); labels and wording can change freely.
export const STUDY_WORKFLOWS: StudyWorkflow[] = [
  {
    id: 'filters-only',
    label: tx('Filter function only'),
    task: tx('Use the filter function to identify the most appropriate app for your assigned scenario.'),
    emphasis: tx('filter function'),
    setup: { filters: 'open', assistant: 'closed' }
  },
  {
    id: 'assistant-only',
    label: tx('AI search assistant only'),
    task: tx('Use the AI search assistant to identify the most appropriate app for your assigned scenario.'),
    emphasis: tx('AI search assistant'),
    setup: { filters: 'closed', assistant: 'open' }
  }
];

export const workflowById = (id: string | undefined) => STUDY_WORKFLOWS.find(w => w.id === id);

// The question asked after Stop (plus "which app", when one was found). The
// study team dropped the ease rating and the suggestions box in 2026-11; old
// runs keep those answers and the dashboard still shows them.
export type FoundAnswer = 'yes' | 'partly' | 'no';

export interface StopAnswers {
  found?: FoundAnswer;
  app?: string;
  ease?: number; // no longer asked; kept for runs recorded before 2026-11
  suggestions?: string; // no longer asked; kept for runs recorded before 2026-11
}

export const FOUND_OPTIONS: { value: FoundAnswer; label: string }[] = [
  { value: 'yes', label: tx('Yes') },
  { value: 'partly', label: tx('Partly') },
  { value: 'no', label: tx('No') }
];
