/*
 * App Submission validation tests (see submissions.js). Submissions are
 * anonymous, so these pin the invariants: fixed schema (unknown keys
 * dropped), required fields, capped strings, whitelisted enums, honeypot,
 * and reviewer-only status changes.
 */
import { sanitizeSubmission, sanitizeStatusUpdate, canReviewSubmissions } from './submissions';
import { buildEmail } from './email';

const valid = () => ({
  submitter: { firstName: 'Ada', lastName: 'Lovelace', organization: 'Calm Co', email: 'Ada@Example.com', relationship: 'developer' },
  app: { name: 'Calm App', iosLink: 'https://apps.apple.com/us/app/calm/id571800810' },
  pitch: 'Helps with anxiety.',
  meetsCriteria: 'yes'
});

describe('App Submissions: sanitizeSubmission', () => {
  it('accepts a minimal valid submission and lowercases the email', () => {
    const { item, error } = sanitizeSubmission(valid());
    expect(error).toBeUndefined();
    expect(item.submitter.email).toBe('ada@example.com');
    expect(item.app.name).toBe('Calm App');
  });

  it('requires submitter details, an app name, a link, a pitch and the eligibility answer', () => {
    const without = mutate => {
      const v = valid();
      mutate(v);
      return sanitizeSubmission(v).error;
    };
    expect(without(v => delete v.submitter.firstName)).toBeTruthy();
    expect(without(v => delete v.submitter.organization)).toBeTruthy();
    expect(without(v => (v.submitter.email = 'nope'))).toBeTruthy();
    expect(without(v => (v.submitter.relationship = 'hacker'))).toBeTruthy();
    expect(without(v => delete v.app.name)).toBeTruthy();
    expect(without(v => delete v.app.iosLink)).toMatch(/link/);
    expect(without(v => delete v.pitch)).toBeTruthy();
    expect(without(v => delete v.meetsCriteria)).toBeTruthy();
  });

  it('rejects non-http links (no javascript: URLs reach the reviewer UI)', () => {
    const v = valid();
    v.app.webLink = 'javascript:alert(1)';
    expect(sanitizeSubmission(v).error).toMatch(/Invalid link/);
  });

  it('drops unknown keys and invalid answers; keeps valid ones', () => {
    const v = valid();
    v.approved = true;
    v._id = 'attacker-chosen';
    v.status = 'converted';
    v.answers = {
      costs: { 'Totally Free': 'yes', Subscription: 'unsure', Payment: 'maybe' },
      features: ['Track Mood', 'Track Mood', 42, 'Journaling'],
      bogus: ['x'],
      readingLevel: '9'
    };
    v.research = { feasibilityStudies: 3, efficacyStudies: -5, rctDigital: 'yes', phones: 'stolen', dropoutRate: 250 };
    const { item } = sanitizeSubmission(v);
    expect(item.approved).toBeUndefined();
    expect(item._id).toBeUndefined();
    expect(item.status).toBeUndefined();
    expect(item.answers.costs).toEqual({ 'Totally Free': 'yes', Subscription: 'unsure' });
    expect(item.answers.features).toEqual(['Track Mood', 'Journaling']);
    expect(item.answers.bogus).toBeUndefined();
    expect(item.answers.readingLevel).toBe(9);
    expect(item.research).toEqual({ feasibilityStudies: 3, efficacyStudies: 0, rctDigital: 'yes', dropoutRate: 100 });
  });

  it('caps long text', () => {
    const v = valid();
    v.pitch = 'x'.repeat(9000);
    expect(sanitizeSubmission(v).item.pitch.length).toBe(5000);
  });

  it('flags the honeypot as spam without an error', () => {
    const v = valid();
    v.website = 'http://spam.example';
    expect(sanitizeSubmission(v)).toEqual({ spam: true });
  });

  it('rejects oversized payloads', () => {
    const v = valid();
    v.answers = { conditions: Array.from({ length: 2000 }, (_, i) => `condition-${i}-${'y'.repeat(50)}`) };
    expect(sanitizeSubmission(v).error).toMatch(/too large/);
  });
});

describe('App Submissions: reviewer updates', () => {
  it('whitelists statuses and validates ids', () => {
    expect(sanitizeStatusUpdate({ _id: 'abc', status: 'approved' }).error).toBeTruthy();
    expect(sanitizeStatusUpdate({ _id: 'bad id!', status: 'declined' }).error).toBeTruthy();
    expect(sanitizeStatusUpdate({ _id: 'abc' }).error).toMatch(/Nothing/);
    expect(sanitizeStatusUpdate({ _id: 'abc', status: 'converted', ratingId: 'not valid!' }).error).toBeTruthy();
    expect(sanitizeStatusUpdate({ _id: 'abc', status: 'converted', ratingId: 'r-1', note: ' done ' })).toEqual({
      update: { status: 'converted', ratingId: 'r-1' },
      note: 'done'
    });
  });

  it('only Submission Reviewers and Super Admins may review', () => {
    expect(canReviewSubmissions({ isSubmissionReviewer: true })).toBe(true);
    expect(canReviewSubmissions({ isSuperAdmin: true })).toBe(true);
    expect(canReviewSubmissions({ isAdmin: true })).toBe(false);
    expect(canReviewSubmissions(undefined)).toBe(false);
  });
});

describe('App Submissions: reviewer notification email', () => {
  it('is internal only — the public email operation cannot send it', () => {
    expect(buildEmail('appSubmission', { id: 'abc' }).error).toMatch(/Unknown email type/);
  });

  it('targets the submissionreviewer role and escapes submitter text', () => {
    const b = buildEmail(
      'appSubmission',
      { id: 'abc-123', submitter: { firstName: '<b>Ada</b>', lastName: 'L', email: 'a@b.co', organization: 'Org', relationship: 'developer' }, app: { name: 'Calm' } },
      { internal: true }
    );
    expect(b.error).toBeUndefined();
    expect(b.to).toBe('roster:submissionreviewer');
    expect(b.body).toContain('&lt;b&gt;Ada&lt;/b&gt;');
    expect(b.body).toContain('https://mindapps.org/Admin?tab=submissions');
    expect(b.subject).toBe('MIND - New App Suggestion: Calm');
  });
});
