/*
 * Wording for the static pages scripts/seo/generate.ts writes at build time (what search engines and AI
 * tools read before the app loads). Marked with tx() so `npm run i18n:extract` collects it into the
 * French/German catalogs like any other interface text; the generator translates it from those catalogs.
 * A local identity tx keeps this module free of React so it loads in the build script.
 */
const tx = (text: string) => text;

export const SITE_NAME = 'MIND';
export const SITE_URL = 'https://mindapps.org';

export const text = {
  siteTitle: tx('MIND: Find and Compare Mental Health Apps'),
  siteDescription: tx(
    'Search {{count}}+ mental health apps independently evaluated on privacy, cost, evidence and features. A free resource from the Division of Digital Psychiatry at BIDMC.'
  ),
  libraryHeading: tx('Mental health apps evaluated by MIND'),
  libraryIntro: tx(
    'MIND, the M-Health Index and Navigation Database, is a free library of mental health apps evaluated by trained raters. Each app is assessed on cost, privacy, supporting evidence, features and the conditions it supports, using 105 objective questions based on the American Psychiatric Association’s App Evaluation Model.'
  ),
  allApps: tx('All evaluated apps ({{count}})'),

  appTitle: tx('{{name}} – MIND app evaluation'),
  appDescription: tx('Independent MIND evaluation of {{name}}: cost, privacy, supporting evidence and features.'),
  by: tx('By {{company}}'),
  evaluationHeading: tx('MIND evaluation'),
  lastReviewed: tx('Last reviewed: {{date}}'),
  storeDescriptionHeading: tx('From the app store'),
  storeDescriptionNote: tx('Description from the app store — not vetted by MIND'),
  reviewHeading: tx('Rater review'),
  reviewNote: tx('This review represents the view of the app rater and is not an endorsement by MIND.'),
  getTheApp: tx('Get the app'),
  appStore: tx('App Store'),
  googlePlay: tx('Google Play'),
  website: tx('Website'),
  backToLibrary: tx('Browse all evaluated apps'),
  aboutFramework: tx('How apps are evaluated'),
  yes: tx('Yes'),
  no: tx('No'),
  unknownCost: tx('Unknown Cost'),

  frameworkTitle: tx('How MIND evaluates mental health apps | MIND'),
  frameworkDescription: tx(
    'The app evaluation framework behind MIND: the questions trained raters answer about cost, privacy, evidence, features and engagement for every app.'
  ),
  communityTitle: tx('Community | MIND'),
  communityDescription: tx('News, events and resources from the MIND team and the Division of Digital Psychiatry at BIDMC.'),
  suggestTitle: tx('Suggest an App | MIND'),
  suggestDescription: tx('Suggest a mental health app for MIND to evaluate. Developers can submit their own app for review.')
};

// The evaluation details shown on each app page, in display order. `field` is the Application record
// field; the heading reuses the library's filter labels so the wording matches the site.
export const evaluationFields: { field: string; heading: string }[] = [
  { field: 'costs', heading: tx('Cost') },
  { field: 'platforms', heading: tx('Platforms') },
  { field: 'conditions', heading: tx('Supported Conditions') },
  { field: 'privacies', heading: tx('Privacy') },
  { field: 'clinicalFoundations', heading: tx('Clinical Foundation') },
  { field: 'features', heading: tx('Features') },
  { field: 'functionalities', heading: tx('Functionalities') },
  { field: 'engagements', heading: tx('Engagements') },
  { field: 'treatmentApproaches', heading: tx('Treatment Approaches') },
  { field: 'inputs', heading: tx('Inputs') },
  { field: 'outputs', heading: tx('Outputs') },
  { field: 'developerTypes', heading: tx('Developer Type') },
  { field: 'countries', heading: tx('Country Availability') }
];
