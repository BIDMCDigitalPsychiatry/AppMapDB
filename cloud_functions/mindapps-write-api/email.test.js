/*
 * Server-side email template/validation tests (see email.js). These pin the
 * security invariants: fixed templates only, user text escaped, recipients
 * chosen server-side, admin gate on the follow-up type.
 */
import { buildEmail } from './email';

describe('write-api email operations', () => {
  it('rejects unknown types (no free-form sending)', () => {
    expect(buildEmail('arbitrary', {}).error).toMatch(/Unknown email type/);
    expect(buildEmail(undefined, {}).error).toBeTruthy();
  });

  it('survey confirmation goes to the validated participant address', () => {
    expect(buildEmail('surveyConfirmation', { email: 'not-an-email' }).error).toBeTruthy();
    const b = buildEmail('surveyConfirmation', { email: 'person@example.com' });
    expect(b.error).toBeUndefined();
    expect(b.to).toBe('participant');
    expect(b.participantEmail).toBe('person@example.com');
    expect(b.subject).toBe('MIND - Survey Complete');
  });

  it('staff notice targets the surveynotify roster role and escapes user text', () => {
    const b = buildEmail('surveyStaffNotice', { email: 'p@example.com', appName: '<script>alert(1)</script>' });
    expect(b.to).toBe('roster:surveynotify');
    expect(b.body).not.toContain('<script>');
    expect(b.body).toContain('&lt;script&gt;');
  });

  it('follow-up requires admin, whitelists the type, and builds the link server-side', () => {
    expect(buildEmail('surveyFollowUp', { email: 'p@example.com', followUpSurveyType: 'Weird', surveyId: 'a1', appId: 'b2' }).error).toBeTruthy();
    expect(buildEmail('surveyFollowUp', { email: 'p@example.com', followUpSurveyType: '2 Week', surveyId: 'bad id!', appId: 'b2' }).error).toBeTruthy();
    const b = buildEmail('surveyFollowUp', { email: 'p@example.com', followUpSurveyType: '2 Week', surveyId: 'abc123', appId: 'def456' });
    expect(b.error).toBeUndefined();
    expect(b.requiresAdmin).toBe(true);
    expect(b.body).toContain('https://mindapps.org/Survey?surveyId=abc123&followUpSurveyType=2%20Week&appId=def456');
  });

  it('rating interest targets the notify role, caps lengths, escapes fields', () => {
    expect(buildEmail('ratingInterest', { email: 'p@example.com', details: 'x'.repeat(5001) }).error).toBeTruthy();
    const b = buildEmail('ratingInterest', { email: 'p@example.com', name: '<b>Bob</b>', title: 'Dr', institution: 'BU', details: 'hi' });
    expect(b.to).toBe('roster:notify');
    expect(b.requiresAdmin).toBe(false);
    expect(b.body).toContain('&lt;b&gt;Bob&lt;/b&gt;');
  });

  it('suggest edit targets the notify role and validates the app id', () => {
    expect(buildEmail('suggestEdit', { suggestion: 'fix', appId: 'not valid!!' }).error).toBeTruthy();
    const b = buildEmail('suggestEdit', { name: 'A', email: 'a@b.co', suggestion: 'fix the cost tag', appName: 'App', appCompany: 'Co', appId: 'abc123' });
    expect(b.error).toBeUndefined();
    expect(b.to).toBe('roster:notify');
    expect(b.subject).toBe('AppMapDB - Suggested Edit');
  });
});
