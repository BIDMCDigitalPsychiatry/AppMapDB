/*
 * Server-side email templates + validation (PLAN_MODERNIZATION.md §1 — the
 * five browser SES flows moved behind the API). Pure module: no AWS calls,
 * fully unit-testable. The handler resolves recipients (roster roles) and
 * performs the actual SES send.
 *
 * Security model: the client sends ONLY structured fields; every subject,
 * body template, recipient list, and the From address are owned here. All
 * user-supplied text is HTML-escaped (the old browser senders interpolated
 * it raw), lengths are capped, and emails/ids are validated.
 */

const SOURCE = 'appmap@psych.digital';
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'https://mindapps.org';

const esc = v =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const isEmail = v => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
const isId = v => typeof v === 'string' && /^[a-z0-9-]{1,64}$/i.test(v);
const capped = (v, max) => typeof v === 'string' && v.length <= max;

const FOLLOW_UP_TYPES = ['2 Week', '6 Week'];

/*
 * Each type: validate(data) -> error string | null;
 * build(data) -> { subject, body };
 * to: 'participant' (data.email) | 'roster:notify' | 'roster:surveynotify';
 * requiresAdmin: the caller must hold the admin role (verified token).
 */
const EMAIL_TYPES = {
  // Thank-you to the participant after completing an app survey.
  surveyConfirmation: {
    to: 'participant',
    requiresAdmin: false,
    validate: d => (!isEmail(d.email) ? 'A valid email address is required' : null),
    build: () => ({
      subject: 'MIND - Survey Complete',
      body: `Hi,
    <p>Thank you for agreeing to participate in our study! We look forward to hearing your thoughts about this app.</p>
    <p>If you have any questions regarding this study, please contact Erica Camacho at ecamach1@bidmc.harvard.edu.</p>
    <p></p>
    <p>Best,</p>
    <p>The Division of Digital Psychiatry</p>`
    })
  },

  // Staff notice that a survey was completed (roster role: surveynotify).
  surveyStaffNotice: {
    to: 'roster:surveynotify',
    requiresAdmin: false,
    validate: d => (!isEmail(d.email) ? 'A valid email address is required' : !capped(d.appName ?? '', 300) ? 'appName too long' : null),
    build: d => ({
      subject: 'MIND - Survey Completed Notification',
      body: `Notice: ${esc(d.email)} has submitted a survey for ${esc(d.appName)}.`
    })
  },

  // Follow-up survey invitation, sent by an admin from the Surveys tab. The
  // link is built server-side from validated ids — the client cannot inject
  // an arbitrary URL into mail sent as mindapps.org.
  surveyFollowUp: {
    to: 'participant',
    requiresAdmin: true,
    validate: d =>
      !isEmail(d.email)
        ? 'A valid email address is required'
        : !FOLLOW_UP_TYPES.includes(d.followUpSurveyType)
        ? 'Unknown follow-up survey type'
        : !isId(d.surveyId) || !isId(d.appId)
        ? 'Invalid survey/app id'
        : !capped(d.appName ?? '', 300)
        ? 'appName too long'
        : null,
    build: d => {
      const link = `${PUBLIC_BASE_URL}/Survey?surveyId=${encodeURIComponent(d.surveyId)}&followUpSurveyType=${encodeURIComponent(
        d.followUpSurveyType
      )}&appId=${encodeURIComponent(d.appId)}`;
      return {
        subject: `MIND - ${d.followUpSurveyType} Survey Follow Up`,
        body: `Hello,
    <p>Thank you for participating in our study! We appreciate hearing your thoughts about the application: ${esc(
      d.appName
    )}. Would you be willing to participate in a follow up survey?  Please <a href="${link}">click here to participate in the ${esc(
          d.followUpSurveyType
        )} Follow Up Survey!</a></p>
    <p></p>
    <p>Best,</p>
    <p>The Division of Digital Psychiatry</p>`
      };
    }
  },

  // "Rate An App" interest form (roster role: notify).
  ratingInterest: {
    to: 'roster:notify',
    requiresAdmin: false,
    validate: d =>
      !isEmail(d.email)
        ? 'A valid email address is required'
        : ![d.name, d.title, d.institution].every(v => capped(v ?? '', 300))
        ? 'Field too long'
        : !capped(d.details ?? '', 5000)
        ? 'Details too long'
        : null,
    build: d => ({
      subject: 'AppMapDB - App Rating Interest',
      body: `A user is interested in app rating:
    <p>User Name: ${esc(d.name)}</p>
    <p>Title: ${esc(d.title)}</p>
    <p>User Email: ${esc(d.email)}</p>
    <p>Institution: ${esc(d.institution)}</p>
    <p>How did you hear about us?: ${esc(d.details)}</p>`
    })
  },

  // "Flag / Suggest an Edit" dialog (roster role: notify).
  suggestEdit: {
    to: 'roster:notify',
    requiresAdmin: false,
    validate: d =>
      !capped(d.name ?? '', 300)
        ? 'Name too long'
        : d.email && !isEmail(d.email)
        ? 'Invalid email address'
        : !capped(d.suggestion ?? '', 10000)
        ? 'Suggestion too long'
        : ![d.appName, d.appCompany].every(v => capped(v ?? '', 300))
        ? 'Field too long'
        : d.appId && !isId(d.appId)
        ? 'Invalid app id'
        : null,
    build: d => ({
      subject: 'AppMapDB - Suggested Edit',
      body: `A suggested edit has been made:
    <p>Application: ${esc(d.appName)}</p>
    <p>Application Company: ${esc(d.appCompany)}</p>
    <p>Application Id: ${esc(d.appId ?? '')}</p>
    <p>User Name: ${esc(d.name)}</p>
    <p>User Email: ${esc(d.email)}</p>
    <p>Suggestion: ${esc(d.suggestion)}</p>`
    })
  }
};

// Validates and renders; returns {error} or {subject, body, to, requiresAdmin, participantEmail}.
const buildEmail = (type, data = {}) => {
  const def = EMAIL_TYPES[type];
  if (!def) return { error: `Unknown email type '${type}'` };
  const invalid = def.validate(data);
  if (invalid) return { error: invalid };
  const { subject, body } = def.build(data);
  return { subject, body, to: def.to, requiresAdmin: def.requiresAdmin, participantEmail: def.to === 'participant' ? data.email : undefined };
};

module.exports = { buildEmail, EMAIL_TYPES, SOURCE, esc };
