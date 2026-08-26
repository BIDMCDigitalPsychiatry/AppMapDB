/*
 * Survey email flows — now thin calls to the write API's server-side email
 * operations (templates, recipients, and the From address live in the
 * Lambda; see cloud_functions/mindapps-write-api/email.js). The staff
 * notice goes to the roster's Survey Notify role.
 */
import { sendApiEmail } from '../../../database/sendEmail';

export function sendSurveyNotificationEmail({ email, appName }) {
  sendApiEmail('surveyStaffNotice', { email, appName });
}

export function sendSurveyEmail({ email }) {
  sendApiEmail('surveyConfirmation', { email });
}

export function sendSurveyFollowUpEmail({ email, appName = '', surveyId = '', appId, followUpSurveyType }) {
  // Admin-only server-side; the follow-up link is built by the Lambda from
  // these validated ids.
  sendApiEmail('surveyFollowUp', { email, appName, surveyId, appId, followUpSurveyType });
}
