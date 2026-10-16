/*
 * App Submissions (public "Submit an App" form → reviewer queue). Pure
 * module: no AWS calls, fully unit-testable. The handler performs the
 * DynamoDB reads/writes and the reviewer notification.
 *
 * Security model: submissions are ANONYMOUS, so the payload is rebuilt from a
 * fixed schema — unknown keys are dropped, every string is length-capped,
 * enums are whitelisted and numbers bounded. The stored row holds submitter
 * PII (name/email), so the table is never readable by the public Cognito
 * role; reviewers read it only through this API (list), gated server-side
 * to the `submissionreviewer` or `superadmin` roster roles.
 */

const TABLE = 'appSubmissions';

const STATUSES = ['new', 'inreview', 'converted', 'declined', 'duplicate'];
const RELATIONSHIPS = ['developer', 'recommender'];
const YES_NO = ['yes', 'no'];
const YES_NO_UNSURE = ['yes', 'no', 'unsure'];

// Evaluation-framework fields (mirror the rating's Application fields so a
// submission can pre-fill a rating). Yes/No/Not sure groups are stored as
// { [questionValue]: 'yes'|'no'|'unsure' }; checklists as string arrays.
const YES_NO_GROUPS = ['costs', 'developerTypes', 'privacies', 'functionalities', 'clinicalFoundations', 'treatmentApproaches', 'countries'];
const CHECKLISTS = ['conditions', 'features', 'engagements', 'inputs', 'outputs', 'uses'];

// Research questions only a developer can answer (not part of the rating).
const RESEARCH_YES_NO = ['rctDigital', 'rctActive', 'rctCareAsUsual', 'rctWaitlist', 'engagementData', 'doseEffect', 'externalResearch', 'coachSupported', 'demographics'];
const RESEARCH_CHOICES = {
  phones: ['new', 'own', 'both'],
  payment: ['technology', 'engagement', 'notPaid']
};

const MAX_BODY_CHARS = 100000;

const isEmail = v => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
const isId = v => typeof v === 'string' && /^[a-z0-9-]{1,64}$/i.test(v);
const isHttp = v => typeof v === 'string' && /^https?:\/\/\S+$/i.test(v) && v.length <= 1000;

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);
const num = (v, min, max) => {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v;
  return typeof n === 'number' && Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : undefined;
};
const oneOf = (v, allowed) => (allowed.includes(v) ? v : undefined);
const strList = (v, maxItems = 40, maxLen = 100) =>
  Array.isArray(v) ? [...new Set(v.filter(x => typeof x === 'string' && x.trim() !== '').map(x => x.trim().slice(0, maxLen)))].slice(0, maxItems) : undefined;

const answerMap = (v, allowed) => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return undefined;
  const out = {};
  for (const [k, a] of Object.entries(v).slice(0, 40)) if (typeof k === 'string' && k.length <= 100 && allowed.includes(a)) out[k] = a;
  return out;
};

// Drops undefined keys so stored rows stay compact.
const compact = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

/*
 * Validates an anonymous submission and returns either { error } or
 * { item } — the sanitized row (without _id/created, which the handler sets).
 * `spam: true` means the honeypot was filled: the handler pretends success
 * but stores nothing.
 */
const sanitizeSubmission = raw => {
  if (!raw || typeof raw !== 'object') return { error: 'Missing submission' };
  if (JSON.stringify(raw).length > MAX_BODY_CHARS) return { error: 'Submission too large' };
  if (typeof raw.website === 'string' && raw.website.trim() !== '') return { spam: true };

  const s = raw.submitter || {};
  const submitter = compact({
    firstName: str(s.firstName, 100),
    lastName: str(s.lastName, 100),
    organization: str(s.organization, 200),
    email: typeof s.email === 'string' ? s.email.trim().toLowerCase() : undefined,
    relationship: oneOf(s.relationship, RELATIONSHIPS)
  });
  if (!submitter.firstName || !submitter.lastName) return { error: 'First and last name are required' };
  if (!submitter.organization) return { error: 'Organization is required' };
  if (!isEmail(submitter.email)) return { error: 'A valid email address is required' };
  if (!submitter.relationship) return { error: 'Please tell us how you are connected to the app' };

  const a = raw.app || {};
  const links = { androidLink: str(a.androidLink, 1000), iosLink: str(a.iosLink, 1000), webLink: str(a.webLink, 1000) };
  for (const [k, v] of Object.entries(links)) if (v && !isHttp(v)) return { error: `Invalid link: ${k}` };
  const app = compact({ name: str(a.name, 200), company: str(a.company, 200), ...links });
  if (!app.name) return { error: 'App name is required' };
  if (!app.androidLink && !app.iosLink && !app.webLink) return { error: 'At least one app link is required' };

  const r = raw.research || {};
  const research = compact({
    feasibilityStudies: num(r.feasibilityStudies, 0, 999),
    efficacyStudies: num(r.efficacyStudies, 0, 999),
    studyLinks: str(r.studyLinks, 5000),
    phones: oneOf(r.phones, RESEARCH_CHOICES.phones),
    payment: oneOf(r.payment, RESEARCH_CHOICES.payment),
    ...Object.fromEntries(RESEARCH_YES_NO.map(k => [k, oneOf(r[k], YES_NO_UNSURE)])),
    followUpDuration: str(r.followUpDuration, 500),
    dropoutRate: num(r.dropoutRate, 0, 100),
    notes: str(r.notes, 5000)
  });

  const ans = raw.answers || {};
  const answers = compact({
    ...Object.fromEntries(YES_NO_GROUPS.map(k => [k, answerMap(ans[k], YES_NO_UNSURE)])),
    ...Object.fromEntries(CHECKLISTS.map(k => [k, strList(ans[k])])),
    readingLevel: num(ans.readingLevel, 0, 30),
    accessibilityDetails: str(ans.accessibilityDetails, 1000),
    privacyPolicyLink: ans.privacyPolicyLink && isHttp(str(ans.privacyPolicyLink, 1000)) ? str(ans.privacyPolicyLink, 1000) : undefined
  });

  const item = compact({
    submitter,
    app,
    pitch: str(raw.pitch, 5000),
    meetsCriteria: oneOf(raw.meetsCriteria, YES_NO),
    criteriaNote: str(raw.criteriaNote, 2000),
    risks: strList(raw.risks, 20, 100),
    risksNote: str(raw.risksNote, 3000),
    research,
    answers,
    additionalInfo: str(raw.additionalInfo, 5000)
  });
  if (!item.pitch) return { error: 'Please tell us about the app' };
  if (!item.meetsCriteria) return { error: 'Please answer the eligibility question' };
  return { item };
};

/*
 * Reviewer status change. Returns { error } or { update } with the fields to
 * SET on the row; a note is appended to the row's notes history by the handler.
 */
const sanitizeStatusUpdate = raw => {
  if (!raw || !isId(raw._id)) return { error: 'Missing submission id' };
  const status = raw.status === undefined ? undefined : oneOf(raw.status, STATUSES);
  if (raw.status !== undefined && !status) return { error: 'Unknown status' };
  if (raw.ratingId !== undefined && !isId(raw.ratingId)) return { error: 'Invalid rating id' };
  const note = str(raw.note, 2000);
  if (!status && !note && raw.ratingId === undefined) return { error: 'Nothing to update' };
  return { update: compact({ status, ratingId: raw.ratingId }), note: note || undefined };
};

const canReviewSubmissions = roles => roles?.isSubmissionReviewer === true || roles?.isSuperAdmin === true;

module.exports = {
  TABLE,
  STATUSES,
  YES_NO_GROUPS,
  CHECKLISTS,
  RESEARCH_YES_NO,
  sanitizeSubmission,
  sanitizeStatusUpdate,
  canReviewSubmissions
};
