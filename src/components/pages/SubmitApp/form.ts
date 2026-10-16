/*
 * Form logic for "Submit an App": step order, per-step validation, the
 * in-browser draft, and the submission → rating pre-fill mapping used by
 * the Admin > App Submissions queue.
 */
import { AppSubmission, SubmissionForm, YesNoUnsure } from '../../../database/appSubmissions';
import { tables } from '../../../database/dbConfig';
import { isEmpty, validateEmail } from '../../../helpers';
import { AnswerField, ITEMS_BY_FIELD, RESEARCH_YES_NO, CHECKLIST_FIELDS, YES_NO_FIELDS } from './content';
import { tx } from '../../../i18n';

export const emptyForm = (): SubmissionForm => ({ submitter: {}, app: {}, research: {}, answers: {} });

export type StepId =
  | 'about'
  | 'app'
  | 'eligibility'
  | 'research'
  | 'basics'
  | 'privacy'
  | 'functionality'
  | 'clinical'
  | 'features'
  | 'inputsOutputs'
  | 'uses'
  | 'final'
  | 'review';

export const STEP_IDS: StepId[] = [
  'about',
  'app',
  'eligibility',
  'research',
  'basics',
  'privacy',
  'functionality',
  'clinical',
  'features',
  'inputsOutputs',
  'uses',
  'final',
  'review'
];

// Errors are keyed by a dotted path so the page can mark and scroll to the
// exact question (e.g. 'answers.costs.Totally Free').
export type Errors = Record<string, string>;

const REQUIRED = tx('Please answer this question');
const isHttpUrl = (v?: string) => !isEmpty(v) && /^https?:\/\/\S+$/i.test((v as string).trim());

const parseUrl = (v?: string) => {
  try {
    return isHttpUrl(v) ? new URL((v as string).trim()) : undefined;
  } catch {
    return undefined;
  }
};

// Store app ids from full store links, or undefined if the link isn't a store link of that kind.
// e.g. https://apps.apple.com/us/app/calm/id571800810 -> '571800810'
export const appleStoreId = (v?: string): string | undefined => {
  const u = parseUrl(v);
  if (!u || !/(^|\.)(apps|itunes)\.apple\.com$/i.test(u.hostname)) return undefined;
  return u.pathname.match(/\/id(\d+)(\/|$)/)?.[1];
};

// e.g. https://play.google.com/store/apps/details?id=com.calm.android&hl=en -> 'com.calm.android'
export const playStoreId = (v?: string): string | undefined => {
  const u = parseUrl(v);
  if (!u || !/(^|\.)play\.google\.com$/i.test(u.hostname)) return undefined;
  const id = u.searchParams.get('id') ?? '';
  return /^[a-zA-Z][\w]*(\.[\w]+)+$/.test(id) ? id : undefined;
};

export const hasPrivacyPolicy = (f: SubmissionForm) => f.answers.privacies?.['Has Privacy Policy'] !== 'no';

// The privacy follow-ups only apply when there is a policy (mirrors the rating form).
export const visibleItems = (field: AnswerField, f: SubmissionForm) =>
  field === 'privacies' && !hasPrivacyPolicy(f) ? ITEMS_BY_FIELD.privacies.filter(i => i.value === 'Has Privacy Policy') : ITEMS_BY_FIELD[field];

export const hasStudies = (f: SubmissionForm) => (f.research.feasibilityStudies ?? 0) > 0 || (f.research.efficacyStudies ?? 0) > 0;

const requireYesNo = (errors: Errors, f: SubmissionForm, field: AnswerField) =>
  visibleItems(field, f).forEach(i => {
    if (!f.answers[field]?.[i.value]) errors[`answers.${field}.${i.value}`] = REQUIRED;
  });

const requireText = (errors: Errors, key: string, value: any, message: string = tx('This field is required')) => {
  if (isEmpty(typeof value === 'string' ? value.trim() : value)) errors[key] = message;
};

const STEP_FIELDS: Partial<Record<StepId, AnswerField[]>> = {
  basics: ['costs', 'developerTypes'],
  privacy: ['privacies'],
  functionality: ['functionalities'],
  clinical: ['clinicalFoundations', 'treatmentApproaches'],
  uses: ['countries']
};

export const validateStep = (step: StepId, f: SubmissionForm): Errors => {
  const errors: Errors = {};
  switch (step) {
    case 'about':
      requireText(errors, 'submitter.firstName', f.submitter.firstName);
      requireText(errors, 'submitter.lastName', f.submitter.lastName);
      requireText(errors, 'submitter.organization', f.submitter.organization);
      if (!validateEmail(f.submitter.email ?? '')) errors['submitter.email'] = tx('Please enter a valid email address');
      requireText(errors, 'submitter.relationship', f.submitter.relationship, tx('Please choose one'));
      break;
    case 'app':
      requireText(errors, 'app.name', f.app.name);
      (['iosLink', 'androidLink', 'webLink'] as const).forEach(k => {
        if (!isEmpty(f.app[k]) && !isHttpUrl(f.app[k])) errors[`app.${k}`] = tx('Please enter a full link starting with https://');
      });
      if (!errors['app.iosLink'] && !isEmpty(f.app.iosLink) && !appleStoreId(f.app.iosLink))
        errors['app.iosLink'] = tx('This doesn’t look like an App Store link — it should look like https://apps.apple.com/us/app/name/id123456789');
      if (!errors['app.androidLink'] && !isEmpty(f.app.androidLink) && !playStoreId(f.app.androidLink))
        errors['app.androidLink'] = tx(
          'This doesn’t look like a Google Play link — it should look like https://play.google.com/store/apps/details?id=com.example.app'
        );
      if (isEmpty(f.app.iosLink) && isEmpty(f.app.androidLink) && isEmpty(f.app.webLink)) errors['app.links'] = tx('Please enter at least one link to the app');
      requireText(errors, 'pitch', f.pitch);
      break;
    case 'eligibility':
      requireText(errors, 'meetsCriteria', f.meetsCriteria, tx('Please choose Yes or No'));
      if (f.meetsCriteria === 'no') requireText(errors, 'criteriaNote', f.criteriaNote, tx('Please tell us which criteria the app doesn’t meet'));
      if (!(f.risks ?? []).length) errors['risks'] = tx('Please select at least one option');
      break;
    case 'research':
      if (f.research.feasibilityStudies === undefined) errors['research.feasibilityStudies'] = tx('Enter a number (0 if none)');
      if (f.research.efficacyStudies === undefined) errors['research.efficacyStudies'] = tx('Enter a number (0 if none)');
      if (hasStudies(f)) {
        RESEARCH_YES_NO.forEach(q => {
          if (!f.research[q.value]) errors[`research.${q.value}`] = REQUIRED;
        });
      }
      break;
    case 'basics':
      if (!(f.answers.conditions ?? []).length) errors['answers.conditions'] = tx('Please select at least one condition');
      break;
    case 'privacy':
      if (!isEmpty(f.answers.privacyPolicyLink) && !isHttpUrl(f.answers.privacyPolicyLink))
        errors['answers.privacyPolicyLink'] = tx('Please enter a full link starting with https://');
      break;
    case 'features':
      break;
    default:
      break;
  }
  (STEP_FIELDS[step] ?? []).forEach(field => requireYesNo(errors, f, field));
  return errors;
};

export const validateAll = (f: SubmissionForm): Errors => STEP_IDS.reduce((acc, s) => ({ ...acc, ...validateStep(s, f) }), {} as Errors);

export const firstInvalidStep = (f: SubmissionForm): number => STEP_IDS.findIndex(s => Object.keys(validateStep(s, f)).length > 0);

/* ------------------------------ Draft ------------------------------- */

const DRAFT_KEY = 'mindapps.submitApp.draft.v1';

export const loadDraft = (): { form: SubmissionForm; step: number } | undefined => {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (!parsed?.form) return undefined;
    // An untouched form isn't worth a "welcome back".
    if (JSON.stringify({ ...emptyForm(), ...parsed.form }) === JSON.stringify(emptyForm()) && !parsed.step) return undefined;
    return { form: { ...emptyForm(), ...parsed.form }, step: Number.isInteger(parsed.step) ? parsed.step : 0 };
  } catch {
    return undefined;
  }
};

export const saveDraft = (form: SubmissionForm, step: number) => {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step, saved: Date.now() }));
  } catch {
    // storage unavailable (private mode / blocked) — the form still works, just without resume
  }
};

export const clearDraft = () => {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
};

// Drops answers to questions that are hidden at submit time (e.g. privacy
// follow-ups after "no privacy policy") and research details when there are
// no studies, so the stored submission matches what the person saw.
export const prepareForSubmit = (f: SubmissionForm): SubmissionForm => {
  const answers = { ...f.answers };
  if (!hasPrivacyPolicy(f)) answers.privacies = { 'Has Privacy Policy': 'no' };
  const research = hasStudies(f)
    ? f.research
    : { feasibilityStudies: f.research.feasibilityStudies, efficacyStudies: f.research.efficacyStudies, notes: f.research.notes };
  return { ...f, answers, research };
};

/* -------------------- Submission → rating pre-fill -------------------- */

const yesValues = (answers?: Record<string, YesNoUnsure>) => Object.keys(answers ?? {}).filter(k => answers?.[k] === 'yes');

const known = (field: AnswerField, values?: string[]) => {
  const allowed = new Set(ITEMS_BY_FIELD[field].map(i => i.value));
  return (values ?? []).filter(v => allowed.has(v));
};

// Questions the submitter answered "Not sure" — shown unanswered and highlighted in the
// rating form, which won't save until the reviewer answers each (see ReviewFlags.tsx).
export const unsureAnswers = (s: SubmissionForm): { field: AnswerField; value: string; label: string }[] =>
  YES_NO_FIELDS.flatMap(field =>
    Object.entries(s.answers?.[field] ?? {})
      .filter(([, a]) => a === 'unsure')
      .map(([value]) => ({ field, value, label: ITEMS_BY_FIELD[field].find(i => i.value === value)?.label ?? value }))
  );

/*
 * Initial values for the rating dialog (`values.applications`). Yes answers
 * become selected values; No and Not sure stay unselected for the reviewer
 * to confirm. Store metadata (icon, description) is fetched by the rating
 * dialog itself from the links.
 */
export const toRatingValues = (s: AppSubmission) => {
  const platforms = [s.app?.androidLink && 'Android', s.app?.iosLink && 'iOS', s.app?.webLink && 'Web'].filter(Boolean);
  return {
    [tables.applications]: {
      platforms,
      androidLink: s.app?.androidLink,
      iosLink: s.app?.iosLink,
      webLink: s.app?.webLink,
      name: s.app?.name,
      company: s.app?.company,
      ...Object.fromEntries(YES_NO_FIELDS.map(field => [field, known(field, yesValues(s.answers?.[field] as Record<string, YesNoUnsure>))])),
      ...Object.fromEntries(CHECKLIST_FIELDS.map(field => [field, known(field, s.answers?.[field] as string[])])),
      readingLevel: s.answers?.readingLevel ?? 0,
      feasibilityStudies: s.research?.feasibilityStudies ?? 0,
      efficacyStudies: s.research?.efficacyStudies ?? 0,
      feasibilityImpact: 0,
      efficacyImpact: 0,
      submissionId: s._id
    }
  };
};
