/*
 * The tasks a study participant can pick when they press Start, and the
 * questions asked after Stop. Kept as a fixed list in code: changing a task
 * is a one-line edit + deploy. Each run stores the task's id AND its English
 * label, so renaming a task later never mislabels old runs.
 *
 * The wording below is a first draft from the analytics plan — the study
 * team should confirm or replace it.
 */
import { tx } from '../i18n';

export interface StudyWorkflow {
  id: string;
  label: string;
  task: string;
}

export const STUDY_WORKFLOWS: StudyWorkflow[] = [
  {
    id: 'filters-only',
    label: tx('Filters only'),
    task: tx('Find a free app for depression that works on Android, using only the filters on the left.')
  },
  {
    id: 'assistant-only',
    label: tx('Search assistant only'),
    task: tx('Find a free app for depression that works on Android, using only the search assistant (the chat button at the bottom right).')
  },
  {
    id: 'open-ended',
    label: tx('Open-ended search'),
    task: tx('Find an app you would recommend to a friend who has trouble sleeping. Use any part of the site.')
  },
  {
    id: 'known-app',
    label: tx('Find a specific app'),
    task: tx('Find the app Headspace and check how it handles your data.')
  },
  {
    id: 'comparison',
    label: tx('Compare two apps'),
    task: tx('Choose between two mindfulness apps using the evidence information shown for each.')
  },
  {
    id: 'free',
    label: tx('Free exploration'),
    task: tx('Explore the app library however you like, and press Stop when you are done.')
  }
];

export const workflowById = (id: string | undefined) => STUDY_WORKFLOWS.find(w => w.id === id);

// Questions after Stop. `ease` is the standard 7-point Single Ease Question
// (SEQ) used in usability research, so results compare with published norms.
export type FoundAnswer = 'yes' | 'partly' | 'no';

export interface StopAnswers {
  found?: FoundAnswer;
  app?: string;
  ease?: number;
  suggestions?: string;
}

export const FOUND_OPTIONS: { value: FoundAnswer; label: string }[] = [
  { value: 'yes', label: tx('Yes') },
  { value: 'partly', label: tx('Partly') },
  { value: 'no', label: tx('No') }
];
