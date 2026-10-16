/*
 * All wording for the public "Submit an App" form lives here — section
 * intros, plain-language questions, one-line hints and the longer "More
 * info" text. It is adapted from the team's App Rater Help Guide, rewritten
 * for developers (the guide speaks to trained raters). Edit wording here
 * without touching the form code.
 *
 * `value` keys MUST match the stored rating values in
 * src/database/models/Application.tsx — that is what lets a submission
 * pre-fill an app rating.
 */
import {
  CostQuestions,
  DeveloperTypeQuestions,
  PrivacyQuestions,
  FunctionalityQuestions,
  ClinicalFoundationQuestions,
  TreatmentApproachQuestions,
  FeatureQuestions,
  EngagementQuestions,
  InputQuestions,
  OutputQuestions,
  CountryQuestions,
  Conditions
} from '../../../database/models/Application';

export interface HelpItem {
  value: string;
  label: string; // the question / option as the submitter sees it
  hint?: string; // always-visible one-liner under the question
  more?: string; // expandable "More info" text (\n\n separates paragraphs)
}

export type YesNoUnsure = 'yes' | 'no' | 'unsure';

// Where a question group sits in the submission payload.
export type AnswerField =
  | 'costs'
  | 'developerTypes'
  | 'privacies'
  | 'functionalities'
  | 'clinicalFoundations'
  | 'treatmentApproaches'
  | 'countries'
  | 'conditions'
  | 'features'
  | 'engagements'
  | 'inputs'
  | 'outputs'
  | 'uses';

export const YES_NO_FIELDS: AnswerField[] = ['costs', 'developerTypes', 'privacies', 'functionalities', 'clinicalFoundations', 'treatmentApproaches', 'countries'];
export const CHECKLIST_FIELDS: AnswerField[] = ['conditions', 'features', 'engagements', 'inputs', 'outputs', 'uses'];

export const NOT_SURE_HINT = 'Choose "Not sure" if you don’t know — our reviewers will check it.';

// Keeps the help text in the same order as the rating form and guarantees
// every question in the rating model has wording here (falls back to the
// rater wording if a new rating question is added later).
const fromModel = (questions: { value: string; label: string; tooltip?: string }[], help: Record<string, Omit<HelpItem, 'value'>>): HelpItem[] =>
  questions.map(q => ({ value: q.value, label: help[q.value]?.label ?? q.label, hint: help[q.value]?.hint ?? q.tooltip, more: help[q.value]?.more }));

/* ----------------------------- About you ------------------------------ */

export const RELATIONSHIPS = [
  { value: 'developer', label: 'I work on this app (developer, owner, or app team)' },
  { value: 'recommender', label: 'I’m recommending an app I don’t work on' }
];

/* ---------------------------- Eligibility ----------------------------- */

export const CRITERIA = [
  { label: 'Costs less than $10 to download', more: 'In-app purchases and subscriptions are fine — this is about the up-front price in the app store.' },
  { label: 'Updated in the last four years', more: 'Check the “Last updated” date on the app store listing.' },
  { label: 'Available to the public', more: 'Anyone can download and use it — for example, it doesn’t require an insurance code, employer login, or clinic referral.' },
  { label: 'Free of stigmatizing, racist, or inaccurate content', more: 'Content is respectful and consistent with accepted clinical guidance.' }
];

export const RISKS: HelpItem[] = [
  {
    value: 'Physical & Psychological Harms',
    label: 'Physical & psychological harms',
    hint: 'e.g. inadequate fail-safes, over-reliance on automation, attention hijacking, distress if the app fails a user'
  },
  { value: 'Economic Harms', label: 'Economic harms', hint: 'e.g. economic exploitation, devaluing human expertise' },
  { value: 'Infringement on Human Rights', label: 'Infringement on human rights', hint: 'e.g. dehumanization, shaming, social isolation' },
  { value: 'Manipulation', label: 'Manipulation', hint: 'e.g. spreading misinformation, exploiting user behavior' },
  { value: 'Privacy Loss', label: 'Privacy loss', hint: 'e.g. no informed consent, third-party access, users can’t delete their data' },
  {
    value: 'Inequality & Discrimination',
    label: 'Inequality & discrimination',
    hint: 'e.g. digital divide, reinforcing bias, works less well for some groups or symptom severities'
  },
  { value: 'None Identified', label: 'We haven’t identified any of these risks' }
];

/* ------------------------------ Research ------------------------------ */

export const RESEARCH_TEXT = {
  feasibility: {
    label: 'How many feasibility or usability studies of this app have been published?',
    hint: 'Studies asking “do people actually use it?” Enter 0 if none.',
    more:
      'Count peer-reviewed studies in which real people used this specific app and the study measured whether they could and would use it (often “feasibility”, “usability” or “acceptability” is in the title).\n\nDon’t count theses or dissertations, review papers, or studies of a different app.'
  },
  efficacy: {
    label: 'How many efficacy studies of this app have been published?',
    hint: 'Studies asking “do people feel better using it?” Randomized controlled trials (RCTs) count. Enter 0 if none.',
    more:
      'Count peer-reviewed studies that measured whether the app does what it claims — for example, comparing symptoms of people who used the app with people who didn’t.\n\nDon’t count theses or dissertations or review papers.'
  },
  studyLinks: {
    label: 'Links to your published studies',
    hint: 'One per line — journal pages, PubMed, or DOI links. This helps our reviewers verify your studies quickly.'
  }
};

export const RESEARCH_CHOICES = {
  phones: {
    label: 'In your research, do participants get a new phone or use their own?',
    options: [
      { value: 'new', label: 'Given a new phone' },
      { value: 'own', label: 'Use their own phone' },
      { value: 'both', label: 'Both, in different studies' }
    ]
  },
  payment: {
    label: 'Are participants paid to take part?',
    hint: 'Payment can raise engagement in a way real users wouldn’t show.',
    options: [
      { value: 'technology', label: 'Paid to use the app in general' },
      { value: 'engagement', label: 'Paid per engagement (e.g. per survey completed)' },
      { value: 'notPaid', label: 'Not paid' }
    ]
  }
};

export const RESEARCH_YES_NO: HelpItem[] = [
  {
    value: 'rctDigital',
    label: 'Do you have an RCT with a digital control group?',
    hint: 'The control group used a different app or digital tool (a “sham” or placebo app counts).'
  },
  { value: 'rctActive', label: 'Do you have an RCT with an active control group?', hint: 'The control group did a non-digital activity, e.g. walking.' },
  { value: 'rctCareAsUsual', label: 'Do you have an RCT with a care-as-usual control group?', hint: 'The control group received their normal clinical care.' },
  { value: 'rctWaitlist', label: 'Do you have an RCT with a waitlist control group?', hint: 'The control group received nothing during the study.' },
  { value: 'engagementData', label: 'Have you published engagement data for study participants or app users?', hint: 'e.g. how often and how long people used the app.' },
  { value: 'doseEffect', label: 'Do you have evidence of a dose effect?', hint: 'People who used the app more saw bigger improvements.' },
  { value: 'externalResearch', label: 'Has research on the app been done by teams outside your own?' },
  { value: 'coachSupported', label: 'In your studies, is app use supported by a coach or research assistant?', hint: 'e.g. check-in calls or reminders from staff.' },
  { value: 'demographics', label: 'Do you report the demographics of your users or study participants?' }
];

export const RESEARCH_FREE_TEXT = {
  followUpDuration: {
    label: 'How long after people stop using the app are outcomes measured?',
    hint: 'e.g. “immediately after”, “3-month follow-up”.'
  },
  dropoutRate: {
    label: 'What is the average drop-out rate in your studies?',
    hint: 'As a percentage of people who started. Leave blank if you don’t know.'
  },
  notes: { label: 'Anything else we should know about your research?', hint: 'Optional.' }
};

/* ------------------------- Evaluation framework ------------------------ */

export const CONDITION_ITEMS: HelpItem[] = Conditions.filter(c => c !== 'Non-Specific').map(c => ({ value: c, label: c }));

export const COST_ITEMS = fromModel(CostQuestions, {
  'Free to Download': {
    label: 'Is the app free to download?',
    hint: 'Nothing has to be paid to download it, even if there are purchases later.'
  },
  'Totally Free': {
    label: 'Is the app totally free?',
    hint: 'No up-front cost AND no in-app purchases or subscriptions of any kind.'
  },
  Payment: {
    label: 'Is there a one-time payment?',
    hint: 'A single fee unlocks the full app — e.g. a lifetime subscription or a one-time ad remover.'
  },
  'In-App Purchase': {
    label: 'Are there in-app purchases?',
    hint: 'Any feature or content that can’t be used without paying.'
  },
  Subscription: {
    label: 'Is there a subscription (monthly, annual, or other recurring payment)?',
    hint: 'Full use of the app depends on a recurring payment.'
  }
});

export const DEVELOPER_TYPE_ITEMS = fromModel(DeveloperTypeQuestions, {
  Government: { label: 'Is the app made by a government agency?', hint: 'e.g. the Department of Veterans Affairs or a national health service.' },
  'For Profit Company': { label: 'Is it made by a for-profit company or individual developer?', hint: 'Most apps are. A company name ending in “LLC” or “Inc.” is for-profit.' },
  'Non-Profit Company': { label: 'Is it made by a non-profit organization?' },
  'Healthcare Company': {
    label: 'Is it made by a healthcare organization?',
    hint: 'e.g. a hospital or health system.',
    more: 'An app from a university-affiliated hospital counts as both a healthcare organization and an academic institution — answer Yes to both.'
  },
  'Academic Institution': { label: 'Is it made by an academic institution?', hint: 'e.g. a university or university research group.' }
});

export const PRIVACY_ITEMS = fromModel(PrivacyQuestions, {
  'Has Privacy Policy': {
    label: 'Does the app have a privacy policy?',
    hint: 'If not, choose No and the rest of this section is skipped.',
    more: 'The policy should be linked from the app store listing. A policy that is only available in a language other than English is treated as No.'
  },
  'Data Stored on Device': {
    label: 'Is user data stored ONLY on the device?',
    hint: 'Answer Yes only if nothing a user enters leaves their phone (except de-identified or aggregate data).'
  },
  'Data Stored on Server': {
    label: 'Is user data stored on a server (including the cloud)?',
    hint: 'If data is stored only on the device, choose No.'
  },
  'Can Delete Data': {
    label: 'Can users delete their data?',
    hint: 'It counts even if users have to email you to request deletion.',
    more: 'It must be available to ALL users — not only California residents, EU residents, or children.'
  },
  'App Declares Data Use and Purpose': {
    label: 'Does the privacy policy say what data you collect and why?'
  },
  'App Reports Security Measures in Place': {
    label: 'Does the privacy policy describe how data is protected?',
    hint: 'e.g. a “Security” section describing encryption or secure storage.'
  },
  'Is PHI Shared': {
    label: 'Is personal health information (PHI) shared outside the app?',
    hint: 'PHI is anything a user enters that identifies them or their health — name, email, birthday, messages, mood or symptom entries.',
    more: 'Data is “shared” if it leaves the app in any way — for example, to advertisers, analytics companies, partners or researchers.'
  },
  'Is De-Identified Data Shared': {
    label: 'Is de-identified (anonymized) data shared?',
    hint: 'Individual records with names and identifiers removed. Usage and log data count.'
  },
  'Is Anonymized/Aggregate Data Shared': {
    label: 'Is aggregate data shared?',
    hint: 'Pooled or statistical data that can’t be traced to any individual.'
  },
  'Can Opt Out of Data Collection': {
    label: 'Can users opt out of data collection or sharing?',
    hint: 'Opting out of cookies alone doesn’t count.'
  },
  'Meets HIPAA': {
    label: 'Does the app claim to be HIPAA compliant?',
    hint: 'Answer Yes only if your privacy policy or listing states it.'
  }
});

export const READING_LEVEL = {
  label: 'What is the reading grade level of your privacy policy?',
  hint: 'Use the free Flesch-Kincaid test: paste your privacy policy into the text box and enter the “grade level” it reports.',
  link: 'https://readabilityformulas.com/free-readability-formula-tests.php',
  linkLabel: 'Open the free readability test'
};

export const PRIVACY_POLICY_LINK = {
  label: 'Link to your privacy policy, if the app has one',
  hint: 'Saves our reviewers time.'
};

export const FUNCTIONALITY_ITEMS = fromModel(FunctionalityQuestions, {
  French: { label: 'Can the app be used in French?' },
  Spanish: { label: 'Can the app be used in Spanish?', hint: 'Our reviewers will check this in the app itself.' },
  Offline: {
    label: 'Does the app work offline?',
    hint: 'It counts if about half the features work in airplane mode.',
    more: 'To test: force-quit the app, turn on airplane mode, then reopen it.'
  },
  Accessibility: {
    label: 'Does the app have at least one accessibility feature?',
    hint: 'e.g. follows the phone’s text-size setting, text-to-speech, dark mode, or a colorblind-friendly mode.'
  },
  'Own Your Own Data': {
    label: 'Can users see, access and delete their own data?',
    hint: 'Usually under “your rights” in the privacy policy. It counts if they must email you.',
    more: 'If the app has no privacy policy, the answer is No.'
  },
  'Email or Export Your Data': {
    label: 'Can users email or export their data from the app?',
    hint: 'e.g. download a file or email a report straight from the app.'
  },
  'Send Your Data to a Medical Record': {
    label: 'Can users send their data to a medical record?',
    hint: 'e.g. syncing with Epic, Cerner or a patient portal. Most apps can’t — that’s fine.'
  }
});

export const ACCESSIBILITY_DETAILS = {
  label: 'Which accessibility features does the app have?',
  hint: 'e.g. “supports Dynamic Type and VoiceOver; dark mode”.'
};

export const CLINICAL_ITEMS = fromModel(ClinicalFoundationQuestions, {
  'Well Written Relevant Content': {
    label: 'Is the app’s content well written, correct and relevant?',
    hint: 'Its claims match what the app actually does.'
  },
  'Does What it Claims': {
    label: 'Does the app do what it claims to do?',
    hint: 'e.g. if the listing says it offers CBT, CBT exercises are really in the app.'
  },
  'Patient Facing': {
    label: 'Is the app meant to be used directly by patients or the public?',
    hint: 'Choose No if it is designed mainly for clinicians (e.g. a diagnosis guide).'
  },
  'Can Cause Harm': {
    label: 'Could the app cause harm?',
    hint: 'Answer honestly — this is about features that need safeguards, not a judgment of the app.',
    more:
      'Answer Yes if the app has any of these:\n\n• advice that goes against clinical guidelines\n• an unmoderated chat room or messaging (including AI chat)\n• meal or calorie tracking\n• crisis information that could be wrong (e.g. an out-of-date hotline number)'
  },
  'Use Warning': {
    label: 'Does the app say it is not a replacement for medical care?',
    hint: 'Usually in the app store description or a message shown in the app.'
  },
  'Supporting Studies': {
    label: 'Are there published studies of this app?',
    hint: 'Peer-reviewed feasibility, usability or efficacy studies of this specific app — the ones you counted earlier.'
  },
  'Appropriately Advises Patient in Case of Emergency': {
    label: 'In an emergency, does the app tell users what to do?',
    hint: 'e.g. shows a crisis line or tells users to seek emergency care when their answers suggest a crisis.'
  }
});

export const TREATMENT_ITEMS = fromModel(TreatmentApproachQuestions, {
  ACT: { label: 'Does the app use Acceptance and Commitment Therapy (ACT)?', hint: 'The app must explicitly say it uses or is based on ACT.' },
  CBT: { label: 'Does the app use Cognitive Behavioral Therapy (CBT)?', hint: 'The app must explicitly say it uses or is based on CBT.' },
  DBT: { label: 'Does the app use Dialectical Behavior Therapy (DBT)?', hint: 'The app must explicitly say it uses or is based on DBT.' },
  'iCBT or Sleep Therapy': {
    label: 'Does the app offer sleep therapy (e.g. CBT for insomnia)?',
    hint: 'Meditation or hypnosis alone doesn’t count.'
  },
  Mindfulness: { label: 'Does the app include mindfulness exercises?', hint: 'Mindfulness must be explicitly named in the listing or the app.' },
  'Physical Health Exercises': {
    label: 'Does the app guide users through physical exercise?',
    hint: 'e.g. a 7-minute workout. Exercise tracking alone or breathing exercises don’t count.'
  }
});

export const FEATURE_ITEMS = fromModel(FeatureQuestions, {
  'Track Mood': { label: 'Mood tracking', hint: 'Users log their mood (emojis or colors count) and can look back at past entries.' },
  'Track Medication': { label: 'Medication tracking', hint: 'Users log when they take a medication.' },
  'Track Sleep': { label: 'Sleep tracking', hint: 'Entered by the user or recorded by a wearable.' },
  'Track Symptoms': { label: 'Symptom tracking', hint: 'e.g. headaches, anxiety, cravings. Counting cigarettes or drinks counts.' },
  Productivity: { label: 'Productivity', hint: 'Help with daily tasks — e.g. habit trackers, or money saved by not smoking.' },
  'Physical Health': { label: 'Physical exercise tracking', hint: 'Users record how long or what kind of exercise they did.' },
  Psychoeducation: { label: 'Psychoeducation', hint: 'Explains mental health conditions or treatments. General physical-health info doesn’t count.' },
  Journaling: { label: 'Journaling', hint: 'Any place to free-write, whatever it’s called.' },
  'Deep Breathing': { label: 'Deep breathing', hint: 'Guided breathing exercises. Meditation counts.' },
  'Picture Gallery/Hope Board': {
    label: 'Picture gallery or hope board',
    hint: 'Users save images or quotes they can look back at, or the app provides a built-in gallery.',
    more: 'Posting photos to a community forum doesn’t count. Adding photos to journal entries that can be browsed later does.'
  },
  'Peer Support': { label: 'Peer support', hint: 'Users can talk with peer specialists or people with lived experience.' },
  'Coach/Therapist Connection': { label: 'Connection to a coach or therapist', hint: 'Users can talk with a professional through the app.' },
  Biodata: { label: 'Passive data collection', hint: 'Collected without user input — e.g. heart rate, skin conductance, sleep.' },
  'Goal Setting/Habits': {
    label: 'Goal setting',
    hint: 'Users set goals and check in on them — e.g. a quit date or “what do you want to work on?”.'
  },
  'Bbot Interaction': { label: 'Chatbot', hint: 'Users talk with a virtual character or bot that responds to them.' },
  'Bio Feedback with Sense Data': {
    label: 'Feedback based on sensor data',
    hint: 'The app uses passive data to give advice — e.g. suggests breathing when heart rate is high.'
  },
  'Identify New Conditions': {
    label: 'Identifies possible conditions',
    hint: 'e.g. a quiz or assessment that suggests a possible diagnosis — even with a “not a diagnosis” disclaimer.'
  }
});

export const ENGAGEMENT_ITEMS = fromModel(EngagementQuestions, {
  'User Generated Data': { label: 'User-entered data', hint: 'Users enter their own information, e.g. mood logs or a diary. True for most apps.' },
  'Chat/Message': { label: 'Chat or messaging', hint: 'Users can send and receive messages, including community groups.' },
  'Assessments/Screenings': {
    label: 'Validated screeners or assessments',
    hint: 'Standard clinical questionnaires such as the PHQ-9 or GAD-7.'
  },
  'Real Time Response': { label: 'Real-time responses', hint: 'Someone or something replies right away (e.g. a chatbot or live chat).' },
  'Asynchronous Response': {
    label: 'Delayed (asynchronous) responses',
    hint: 'Replies come at set intervals, e.g. a therapist who answers once a day.'
  },
  'Gamification (Points/Badges)': { label: 'Gamification', hint: 'App-specific points, badges, streaks or rewards.' },
  Videos: { label: 'Videos', hint: 'Intro videos count.' },
  'Audio/Music/Scripts': { label: 'Audio, music or guided scripts', hint: 'e.g. guided meditation audio.' },
  'AI Support': { label: 'AI support', hint: 'Users interact with an AI or chatbot rather than a person.' },
  'Peer Support': { label: 'Peer support', hint: 'Users actually communicate with people who have lived experience.' },
  'Network Support': { label: 'Support from family or friends', hint: 'e.g. users save contacts to reach out to when they need help.' },
  'Collaborative With Provider/Other': {
    label: 'Collaboration with a clinician',
    hint: 'A clinician can see the user’s data and adjust the app — e.g. a clinician dashboard.'
  }
});

export const INPUT_ITEMS = fromModel(InputQuestions, {
  Surveys: { label: 'Surveys', hint: 'Mood or symptom surveys users can fill in. A one-time intro survey doesn’t count.' },
  Diary: { label: 'Diary or free writing' },
  Geolocation: { label: 'Location', hint: 'The app asks for access to the phone’s location.' },
  'Contact List': { label: 'Contact list', hint: 'The app asks for access to the phone’s contacts.' },
  Camera: { label: 'Camera', hint: 'e.g. profile photo, photo diary, or video calls — including paid features.' },
  Microphone: { label: 'Microphone', hint: 'The app asks for microphone access — including paid features.' },
  'Step Count': { label: 'Step count', hint: 'Often through Apple Health or Google Fit.' },
  'External Devices': { label: 'External devices', hint: 'e.g. a smartwatch or heart-rate monitor. Earbuds don’t count.' },
  'Social Network': { label: 'Social media login', hint: 'Sign in with Facebook, Google, etc. Apple ID doesn’t count.' }
});

export const OUTPUT_ITEMS = fromModel(OutputQuestions, {
  Notifications: { label: 'Notifications', hint: 'Messages, reminders or alerts sent to the phone.' },
  'References/Information': { label: 'References or information', hint: 'Any educational content. Choose this if you chose Psychoeducation.' },
  'Social Network': { label: 'Post to social media', hint: 'Users can share their own data or progress to social media.' },
  Reminders: { label: 'Reminders', hint: 'Users can set reminders.' },
  'Graphs of Data': { label: 'Graphs', hint: 'Bar, line or pie charts of the user’s data.' },
  'Summary of Data': { label: 'Written summaries', hint: 'Text or number summaries of the user’s data.' },
  'Link to Formal Care/Coaching': {
    label: 'Links to formal care',
    hint: 'Phone numbers or websites for hospitals, therapists or coaches outside the app.'
  }
});

// Kids Help Phone approval is set by a partner team, not submitters.
export const USE_ITEMS: HelpItem[] = [
  {
    value: 'Self Help',
    label: 'Self-help or self-management',
    hint: 'Activities people use on their own, e.g. mood tracking or mindfulness exercises.'
  },
  { value: 'Reference', label: 'Reference', hint: 'Mainly information and references rather than activities.' },
  {
    value: 'Hybrid',
    label: 'Used alongside a clinician’s treatment plan',
    hint: 'Designed to support in-person care, not replace it.',
    more: 'Apps with built-in ways to collaborate with a provider usually count. A teletherapy app usually doesn’t, because it replaces in-person care.'
  }
];

export const COUNTRY_ITEMS = fromModel(CountryQuestions, {
  Canada: { label: 'Is the app available in Canada?', hint: 'Someone in Canada can download and use it.' },
  France: { label: 'Is the app available in France?', hint: 'Someone in France can download and use it.' },
  UK: { label: 'Is the app available in the UK?', hint: 'Someone in the United Kingdom can download and use it.' },
  Germany: { label: 'Is the app available in Germany?', hint: 'Someone in Germany can download and use it.' }
});

export const ITEMS_BY_FIELD: Record<AnswerField, HelpItem[]> = {
  costs: COST_ITEMS,
  developerTypes: DEVELOPER_TYPE_ITEMS,
  privacies: PRIVACY_ITEMS,
  functionalities: FUNCTIONALITY_ITEMS,
  clinicalFoundations: CLINICAL_ITEMS,
  treatmentApproaches: TREATMENT_ITEMS,
  countries: COUNTRY_ITEMS,
  conditions: CONDITION_ITEMS,
  features: FEATURE_ITEMS,
  engagements: ENGAGEMENT_ITEMS,
  inputs: INPUT_ITEMS,
  outputs: OUTPUT_ITEMS,
  uses: USE_ITEMS
};

/* ------------------------------ Sections ------------------------------ */

export interface SectionText {
  title: string;
  intro: string;
  tip?: string; // shown with a lightbulb under the intro
}

export const SECTIONS: Record<string, SectionText> = {
  about: {
    title: 'About you',
    intro: 'Thanks for suggesting an app for MINDapps! The whole form takes about 15–20 minutes. Your answers are saved in this browser as you go, so you can come back later.',
    tip: 'We only use your contact details to follow up about this app.'
  },
  app: {
    title: 'The app',
    intro: 'Tell us which app this is. Paste the app store links and we’ll look up the app’s name and developer for you.'
  },
  eligibility: {
    title: 'Eligibility',
    intro: 'MINDapps only lists apps that meet four basic criteria. We also ask about potential risks so our reviewers know what to look for.'
  },
  research: {
    title: 'Research',
    intro: 'MINDapps shows people what evidence exists for each app. If there are no published studies yet, enter 0 and continue — many listed apps have none.',
    tip: 'Only count peer-reviewed studies of this specific app. Review papers and dissertations don’t count.'
  },
  basics: {
    title: 'Conditions, cost & developer',
    intro: 'These answers drive the filters people use to find apps on MINDapps.',
    tip: 'Have your app store listing open — most of these answers are there.'
  },
  privacy: {
    title: 'Privacy & security',
    intro: 'People choosing a mental health app care a lot about their data.',
    tip: 'Open your privacy policy before you start — almost every answer in this section comes from it.'
  },
  functionality: {
    title: 'Functionality & data access',
    intro: 'What the app supports, and what users can do with their own data.'
  },
  clinical: {
    title: 'Clinical foundations & treatment approaches',
    intro: 'How the app handles clinical content and safety, and which therapy approaches it uses.',
    tip: 'Only answer Yes to a therapy approach if the app or its listing explicitly names it.'
  },
  features: {
    title: 'Features & engagement',
    intro: 'Check everything the app offers. Leave a box unchecked if the app doesn’t have it.'
  },
  inputsOutputs: {
    title: 'Inputs & outputs',
    intro: 'What the app collects from users and the phone, and what it gives back.',
    tip: 'Count a permission (location, contacts, camera, microphone) only if the app actually asks for it — not if it is only mentioned in the privacy policy.'
  },
  uses: {
    title: 'Intended use & availability',
    intro: 'Who the app is designed for, and where it can be downloaded.'
  },
  final: {
    title: 'Anything else?',
    intro: 'Add anything that would help our reviewers — for example, a target audience, features behind a paywall, or features that are planned but not live yet.'
  },
  review: {
    title: 'Review & send',
    intro: 'Check your answers below. Use “Edit” to change anything, then send your suggestion.'
  }
};
