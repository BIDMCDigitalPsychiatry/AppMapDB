/*
 * App Submissions client (public "Submit an App" form → Admin > App
 * Submissions). Everything goes through the write API's `submission` route:
 * `submit` is anonymous; `list`/`update` attach the session token and are
 * gated server-side to the Submission Reviewer / Super Admin roles. The
 * table is NOT readable by the public Cognito role (rows hold submitter PII),
 * so there is no direct DynamoDB access here.
 */
import { Auth } from 'aws-amplify';
import { WRITE_API_URL } from './useProcessData';
import { tx } from '../i18n';

export type YesNoUnsure = 'yes' | 'no' | 'unsure';
export type SubmissionStatus = 'new' | 'inreview' | 'converted' | 'declined' | 'duplicate';

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  new: tx('New'),
  inreview: tx('In review'),
  converted: tx('Rating created'),
  declined: tx('Declined'),
  duplicate: tx('Duplicate')
};

export interface SubmissionForm {
  submitter: { firstName?: string; lastName?: string; organization?: string; email?: string; relationship?: 'developer' | 'recommender' };
  app: { name?: string; company?: string; androidLink?: string; iosLink?: string; webLink?: string };
  pitch?: string;
  meetsCriteria?: 'yes' | 'no';
  criteriaNote?: string;
  risks?: string[];
  risksNote?: string;
  research: {
    feasibilityStudies?: number;
    efficacyStudies?: number;
    studyLinks?: string;
    phones?: string;
    payment?: string;
    rctDigital?: YesNoUnsure;
    rctActive?: YesNoUnsure;
    rctCareAsUsual?: YesNoUnsure;
    rctWaitlist?: YesNoUnsure;
    engagementData?: YesNoUnsure;
    doseEffect?: YesNoUnsure;
    externalResearch?: YesNoUnsure;
    coachSupported?: YesNoUnsure;
    demographics?: YesNoUnsure;
    followUpDuration?: string;
    dropoutRate?: number;
    notes?: string;
  };
  answers: {
    costs?: Record<string, YesNoUnsure>;
    developerTypes?: Record<string, YesNoUnsure>;
    privacies?: Record<string, YesNoUnsure>;
    functionalities?: Record<string, YesNoUnsure>;
    clinicalFoundations?: Record<string, YesNoUnsure>;
    treatmentApproaches?: Record<string, YesNoUnsure>;
    countries?: Record<string, YesNoUnsure>;
    conditions?: string[];
    features?: string[];
    engagements?: string[];
    inputs?: string[];
    outputs?: string[];
    uses?: string[];
    readingLevel?: number;
    accessibilityDetails?: string;
    privacyPolicyLink?: string;
  };
  additionalInfo?: string;
  website?: string; // honeypot — hidden from people, filled by bots
}

export interface SubmissionNote {
  at: number;
  by: string;
  text: string;
  status?: SubmissionStatus;
}

export interface AppSubmission extends SubmissionForm {
  _id: string;
  created: number;
  updated: number;
  updatedBy?: string;
  status: SubmissionStatus;
  ratingId?: string;
  notes?: SubmissionNote[];
}

const post = async (submission: Record<string, any>, withToken: boolean) => {
  if (!WRITE_API_URL) throw new Error('Write API not configured');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (withToken) {
    const session = await Auth.currentSession();
    headers.Authorization = `Bearer ${session.getIdToken().getJwtToken()}`;
  }
  const res = await fetch(WRITE_API_URL, { method: 'POST', headers, body: JSON.stringify({ submission }) });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || json.ok !== true) throw new Error(json?.error ?? `Request failed (${res.status})`);
  return json;
};

export const submitApp = async (data: SubmissionForm): Promise<string | undefined> => (await post({ op: 'submit', data }, false)).id;

export const listSubmissions = async (): Promise<AppSubmission[]> => (await post({ op: 'list' }, true)).submissions ?? [];

export const updateSubmission = async (data: { _id: string; status?: SubmissionStatus; ratingId?: string; note?: string }): Promise<AppSubmission> =>
  (await post({ op: 'update', data }, true)).data;
