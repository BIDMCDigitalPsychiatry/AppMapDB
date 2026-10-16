import { AndroidStoreProps } from '../../components/application/DialogField/AndroidStore';
import { AppleStoreProps } from '../../components/application/DialogField/AppleStore';
import { sortAscendingToLower } from '../../helpers';
import { tx } from '../../i18n';

export type Platform = 'Android' | 'iOS' | 'Web';
export const Platforms: Platform[] = ['Android', 'iOS', tx('Web')];
export const PlatformImages = [
  { value: 'Android', label: 'Android', image: '/images/newandroid.png' },
  { value: 'iOS', label: 'iOS', image: '/images/newapple.png' },
  { value: tx('Web'), label: tx('Web'), image: '/images/newweb.png' }
];

export type Cost = 'Totally Free' | 'Free to Download' | 'In-App Purchase' | 'Payment' | 'Subscription';
export const CostImages = [
  { value: 'Android', label: tx('Totally Free'), image: '/images/free.png' },
  { value: 'iOS', label: tx('Can Cost Money'), image: '/images/money.png' }
];

export const CostQuestions = [
  { value: tx('Free to Download'), label: tx('Is the app free to download?'), tooltip: tx('Some apps may be free up front but then have in app purchases.') },
  { value: tx('Totally Free'), label: tx('Is the app totally free?'), tooltip: tx('No cost up front, no in app purchases.') },
  { value: tx('Payment'), label: tx('Is there a one time payment?') },
  { value: tx('In-App Purchase'), label: tx('Are there in-app purchases?') },
  { value: tx('Subscription'), label: tx('Is there a subscription (recurrent/monthly/annual)?') }
];

export const Costs: Cost[] = CostQuestions.map(cq => cq.value as Cost);

export type ClinicalFoundation =
  | 'Well Written Relevant Content'
  | 'Does What it Claims'
  | 'Patient Facing'
  | 'Can Cause Harm'
  | 'Supporting Studies'
  | 'Use Warning';

export const ClinicalFoundationQuestions = [
  {
    value: tx('Well Written Relevant Content'),
    short: tx('Well Written'),
    label: tx('Is the app content well-written, correct, and relevant?')
  },
  {
    value: tx('Does What it Claims'),
    short: tx('Does as Claims'),
    label: tx('Does the app appear to do what it claims to do?'),
    tooltip: tx('If the app claims to offer CBT, for example, is there evidence that CBT is provided on the app?')
  },
  {
    value: tx('Patient Facing'),
    label: tx('Is the app patient facing?'),
    tooltip: tx('Is the app relevant and intended for an individual with the condition the app relates to?')
  },
  {
    value: tx('Can Cause Harm'),
    label: tx('Can the app cause harm?'),
    tooltip:
      tx("Does the app make recommendations or suggestions that directly defy clinical guidelines? Does it include overtly false information, like a suicide hotline number that doesn't actually work?")
  },
  { value: tx('Use Warning'), label: tx('Does the app specify that it is not a replacement for medical care?') },
  { value: tx('Supporting Studies'), label: tx('Does the app contain supporting studies?') },
  {
    value: tx('Appropriately Advises Patient in Case of Emergency'),
    label: tx('In the case of an emergency does the app appropriately advise the patient?')
  }
];

export const ClinicalFoundations: ClinicalFoundation[] = ClinicalFoundationQuestions.map(cfq => cfq.value as ClinicalFoundation);

export type Privacy =
  | 'Has Privacy Policy'
  | 'Data Stored on Device'
  | 'Data Stored on Server'
  | 'Can Delete Data'
  | 'App Declares Data Use and Purpose'
  | 'App Reports Security Measures in Place'
  | 'Is PHI Shared'
  | 'Is De-Identified Data Shared'
  | 'Is Anonymized/Aggregate Data Shared'
  | 'Can Opt Out of Data Collection'
  | 'Meets HIPAA';
// | 'Has Crisis Management Feature';

const hasPrivacyPolicy = value => !value.includes('Has Privacy Policy');

export const PrivacyQuestions = [
  { value: tx('Has Privacy Policy'), short: tx('Has Policy'), label: tx('Is there a privacy policy?') },
  {
    value: tx('Data Stored on Device'),
    short: tx('Device Storage'),
    label: tx('Is the data stored only on the device?'),
    tooltip: tx('User data is either stored locally (exclusively on the device) or on a server.'),
    hidden: hasPrivacyPolicy
  },
  {
    value: tx('Data Stored on Server'),
    short: tx('Server Storage'),
    label: tx('Is the data stored on a server?'),
    tooltip: tx('If the data is stored only on the device, then it won’t be stored on a server.'),
    hidden: hasPrivacyPolicy
  },
  {
    value: tx('Can Delete Data'),
    short: tx('Can Delete Data'),
    label: tx('Can you delete your data?'),
    tooltip: tx('Can user data be deleted? Some apps may retain data permanently even if the user deletes the app.'),
    hidden: hasPrivacyPolicy
  },
  { value: tx('App Declares Data Use and Purpose'), short: tx('Declares Purpose'), label: tx('Does the app declare data use and purpose?'), hidden: hasPrivacyPolicy },
  {
    value: tx('App Reports Security Measures in Place'),
    short: tx('Security Measures'),
    label: tx('Does the app report security measures in place?'),
    hidden: hasPrivacyPolicy
  },
  {
    value: tx('Is PHI Shared'),
    label: tx('Is PHI shared?'),
    short: tx('PHI Shared'),
    tooltip:
      tx('PHI refers to personal health information that is entered into the app (name, birthday, content of messages, mental health information). Data is shared if it leaves the app in any way.'),
    hidden: hasPrivacyPolicy
  },
  {
    value: tx('Is De-Identified Data Shared'),
    short: tx('De-Indentifed/Anonymized Data Shared'),
    label: tx('Is de-identified/anonymized data shared?'),
    tooltip:
      tx('De-identified/anonymized data is information that has been stripped of personally identifiable attributes (Names and identifiers have been stripped, but the individual information remains)'),
    hidden: hasPrivacyPolicy
  },
  {
    value: tx('Is Anonymized/Aggregate Data Shared'),
    short: tx('Aggregated Data Shared'),
    label: tx('Is aggregate data shared?'),
    tooltip: tx('Aggregated data can no longer be associated with an individual in any manner.'),
    hidden: hasPrivacyPolicy
  },
  {
    value: tx('Can Opt Out of Data Collection'),
    short: tx('Data Collection Opt Out'),
    label: tx('Can you opt out of data collection?'),
    tooltip: tx('Is there a way for a user to indicate that they don’t want to app to collect or share their data?'),
    hidden: hasPrivacyPolicy
  },
  { value: tx('Meets HIPAA'), label: tx('Does the app claim to meet HIPAA?'), hidden: hasPrivacyPolicy }
  /* This was changed and moved under the Clinical Foundation section
  {
    value: tx('Has Crisis Management Feature'),
    short: tx('Crisis Management Feature'),
    label: tx('Does the app have a crisis management feature?'),
    tooltip: tx('An app’s emergency response or crisis management feature is often detailed in the privacy policy.'),
    hidden: hasPrivacyPolicy
  }*/
];

export const Privacies: Privacy[] = PrivacyQuestions.map(pq => pq.value as Privacy);

export type Engagement =
  | 'User Generated Data'
  | 'Chat/Message'
  | 'Assessments/Screenings'
  | 'Real Time Response'
  | 'Asynchronous Response'
  | 'Gamification (Points/Badges)'
  | 'Videos'
  | 'Audio/Music/Scripts'
  | 'AI Support'
  | 'Peer Support'
  | 'Network Support'
  | 'Collaborative With Provider/Other';

export const EngagementQuestions = [
  { value: tx('User Generated Data'), label: tx('User generated data?'), tooltip: tx('Examples include mood tracking, diary app, etc.') },
  { value: tx('Chat/Message'), label: tx('Chat/message based?') },
  { value: tx('Assessments/Screenings'), label: tx('Does app have have screeners/assesments?'), tooltip: tx('Examples include PHQ9, GAD7, etc.') },
  { value: tx('Real Time Response'), label: tx('Real time response?'), tooltip: tx('Someone will reply to your chat right away.') },
  {
    value: tx('Asynchronous Response'),
    label: tx('Asynchronous response?'),
    tooltip: tx('There are no immediate responses to chats. Responses come at predetermined intervals (once a day; every four hours; etc)')
  },
  {
    value: tx('Gamification (Points/Badges)'),
    short: tx('Gamification'),
    label: tx('Gamification (points, badges)?'),
    tooltip: tx('User can win points and prizes for engaging with the app.')
  },
  { value: tx('Videos'), label: tx('Videos?') },
  {
    value: tx('Audio/Music/Scripts'),
    label: tx('Audio/music/scripts?'),
    tooltip: tx('Does the app provide music or audio experiences? Some meditation apps, for example, utilize audio.')
  },
  { value: tx('AI Support'), label: tx('AI support'), tooltip: tx('Interaction is not with a real person but with a bot.') },
  {
    value: tx('Peer Support'),
    label: tx('Peer support?'),
    tooltip: tx('Peer is defined as a person with lived experience and support involves actually communicating (so not just watching a video)')
  },
  { value: tx('Network Support'), label: tx('Network support?'), tooltip: tx('Network is defined as someone (like family or friend) who is actually known.') },
  {
    value: tx('Collaborative With Provider/Other'),
    short: tx('Collaboration'),
    label: tx('Collaborative with provider/other?'),
    tooltip: tx('Does it allow for direct collaboration with a provider or clinician? Beyond just being able to share your data')
  }
];

export const Engagements: Engagement[] = EngagementQuestions.map(eq => eq.value as Engagement);

export type Functionality =
  | 'French'
  | 'Spanish'
  | 'Offline'
  | 'Accessibility'
  | 'Own Your Own Data'
  | 'Email or Export Your Data'
  | 'Send Your Data to a Medical Record';

export const FunctionalityQuestions = [
  { value: tx('French'), label: tx('Does the app work with French?'), tooltip: tx('Test it on the app itself and confirm via the app store.') },
  { value: tx('Spanish'), label: tx('Does the app work with Spanish?'), tooltip: tx('Test it on the app itself and confirm via the app store.') },
  { value: tx('Offline'), label: tx('Does the app work offline?'), tooltip: tx('Does the app work in airplane mode?') },
  {
    value: tx('Accessibility'),
    label: tx('Does it have at least one accessibility feature?'),
    tooltip:
      tx('Does the app work with the adjustable text size setting of the phone? Or text to voice features? Does the app have an internal setting for increasing text size?')
  },
  {
    value: tx('Own Your Own Data'),
    short: tx('Own Data'),
    label: tx('Do you own your own data?'),
    tooltip: tx('This can be found in the privacy policy of the app but is relevant for data sharing capacity. Can a user see and access their data from the app?')
  },
  {
    value: tx('Email or Export Your Data'),
    short: tx('Export Data'),
    label: tx('Can you email or export your data?'),
    tooltip: tx('Can data be downloaded or exported, or emailed straight from the app?')
  },
  {
    value: tx('Send Your Data to a Medical Record'),
    short: tx('Send Record'),
    label: tx('Can you send your data to a medical record?'),
    tooltip: tx('Does the app sync with EMR? Most apps are not currently equipped with connections to medical record.')
  }
];

export const Functionalities: Functionality[] = FunctionalityQuestions.map(fq => fq.value as Functionality);

export type Input = 'Surveys' | 'Diary' | 'Geolocation' | 'Contact List' | 'Camera' | 'Microphone' | 'Step Count' | 'External Devices' | 'Social Network';
export const InputQuestions = [
  { value: tx('Surveys'), label: tx('Surveys?'), tooltip: tx('Does the app enable a user to enter surveys such as mood or symptom surveys?') },
  { value: tx('Diary'), label: tx('Diary?'), tooltip: tx('Does the app have a journaling, diary, or free writing feature?') },
  { value: tx('Geolocation'), label: tx('Geolocation?'), tooltip: tx('Does the app enable location services from the phone?') },
  { value: tx('Contact List'), label: tx('Contact List?'), tooltip: tx('Can a user connect their contact list to the app?') },
  {
    value: tx('Camera'),
    label: tx('Camera?'),
    tooltip: tx('Do any features of the app utilize camera input? So profile picture? Or photo diary features? Or video chat?')
  },
  { value: tx('Microphone'), label: tx('Microphone?') },
  { value: tx('Step Count'), label: tx('Step Count?'), tooltip: tx('Does the app utilize step tracking?') },
  {
    value: tx('External Devices'),
    label: tx('External Devices'),
    tooltip: tx(`Does the app connect with an external device such as a smart watch or heart rate monitor?`)
  },
  {
    value: tx('Social Network'),
    label: tx('Social Network?'),
    tooltip: tx('Connection to social media. Does the app allow you to input social media information? For example, do you connect it to your facebook to log in?')
  }
];

export const Inputs: Input[] = InputQuestions.map(iq => iq.value as Input);

export type Output =
  | 'Notifications'
  | 'References/Information'
  | 'Social Network'
  | 'Reminders'
  | 'Graphs of Data'
  | 'Summary of Data'
  | 'Link to Formal Care/Coaching';

export const OutputQuestions = [
  {
    value: tx('Notifications'),
    label: tx('Notifications?'),
    tooltip: tx('Does the app send notifications? These notifications could be incoming messages, reminders from the app, or alerts.')
  },
  { value: tx('References/Information'), label: tx('References/Information?'), tooltip: tx('Does the app provide psychoeducational references or information?') },
  {
    value: tx('Social Network'),
    label: tx('Social Network?'),
    tooltip: tx('Can you post information from the app to social media? Does the app connect to social media for posting purposes?')
  },

  {
    value: tx('Reminders'),
    label: tx('Reminders?'),
    tooltip: tx('Does the app allow you to set reminders? (Oftentimes these reminders will then generate notifications)')
  },
  { value: tx('Graphs of Data'), label: tx('Graphs of Data?'), tooltip: tx('Does the app allow a user to see graphically depicted data?') },
  { value: tx('Summary of Data'), label: tx('Summary of Data?'), tooltip: tx('Does the app provide written summaries of data (description of data apart from a graph)?') },
  {
    value: tx('Link to Formal Care/Coaching'),
    label: tx('Link to Formal Care/Coaching?'),
    tooltip: tx('Does the app connect a user with a healthcare provider? A licensed therapist or clinician?')
  }
];

export const Outputs: Output[] = [
  tx('Notifications'),
  tx('References/Information'),
  tx('Social Network'),
  tx('Reminders'),
  tx('Graphs of Data'),
  tx('Summary of Data'),
  tx('Link to Formal Care/Coaching')
];

export type TreatmentApproach = 'ACT' | 'CBT' | 'DBT' | 'iCBT or Sleep Therapy' | 'Mindfulness' | 'Physical Health Exercises';

export const TreatmentApproachQuestions = [
  { value: tx('ACT'), label: tx('Does app have ACT?'), tooltip: tx('Does the app provide Acceptance and Commitment Therapy?') },
  { value: tx('CBT'), label: tx('Does app have CBT?'), tooltip: tx('Does the app provide cognitive-behavioral therapy?') },
  { value: tx('DBT'), label: tx('Does app have DBT?'), tooltip: tx('Does the app provide dialectical behavior therapy?') },
  {
    value: tx('iCBT or Sleep Therapy'),
    label: tx('Does app have iCBT or sleep therapy?'),
    tooltip: tx('Does the app offer sleep therapy of any kind (including iCBT, a targeted sleep intervention)?')
  },
  { value: tx('Mindfulness'), label: tx('Does app have mindfulness?') },
  {
    value: tx('Physical Health Exercises'),
    label: tx('Does app have physical health exercises?'),
    tooltip: tx('Something like a 7 minute workout that actually gives a workout.  This is a recommendation of exercises, NOT exercise tracking.')
  }
];

export const TreatmentApproaches = TreatmentApproachQuestions.map(fq => fq.value as Feature);

export type Feature =
  | 'Track Mood'
  | 'Track Medication'
  | 'Track Sleep'
  | 'Track Symptoms'
  | 'Productivity'
  | 'Physical Health'
  | 'Psychoeducation'
  | 'Journaling'
  | 'Deep Breathing'
  | 'Picture Gallery/Hope Board'
  | 'Peer Support'
  | 'Coach/Therapist Connection'
  | 'Biodata'
  | 'Goal Setting/Habits'
  | 'Bbot Interaction'
  | 'Bio Feedback with Sense Data';

export const FeatureQuestions = [
  { value: tx('Track Mood'), label: tx('Does app have mood tracking?') },
  { value: tx('Track Medication'), label: tx('Does app have medication tracking?') },
  {
    value: tx('Track Sleep'),
    label: tx('Does app have sleep tracking?'),
    tooltip: tx('Does the app track sleep, either in conjunction with a wearable or through user-entered information?')
  },
  { value: tx('Track Symptoms'), label: tx('Does app have symptom tracking?') },
  { value: tx('Productivity'), label: tx('Does app have productivity?') },
  {
    value: tx('Physical Health'),
    label: tx('Does app have physical exercise tracking?'),
    tooltip: tx('Does it allow a user to track duration or content of physical exercise?')
  },
  {
    value: tx('Psychoeducation'),
    label: tx('Does app have psychoeducation?'),
    tooltip: tx('Does app provide definitions, explanations of different diagnoses? Is it didactic?')
  },
  { value: tx('Journaling'), label: tx('Does app have journaling?') },
  { value: tx('Deep Breathing'), label: tx('Does app have deep breathing?') },
  {
    value: tx('Picture Gallery/Hope Board'),
    label: tx('Does app have a picture gallery or hope board?'),
    tooltip: tx('Does the app allow a user to curate a gallery of saved and searched images and quotes?')
  },
  {
    value: tx('Peer Support'),
    label: tx('Does app have peer support?'),
    tooltip: tx('Does the app offer connection to peer specialists or individuals with lived experience?')
  },
  {
    value: tx('Coach/Therapist Connection'),
    label: tx('Does have have a connection to coach/therapist?'),
    tooltip: tx('The app has a built-in way to connect with a provider or coach.')
  },
  { value: tx('Biodata'), label: tx('Does app have passive data tracking?'), tooltip: tx('Does it collect heart rate, skin conductance, etc.') },
  { value: tx('Goal Setting/Habits'), label: tx('Does app have goal setting/habits?'), tooltip: tx('Productivity feature allowing user to set and check in on goals.') },
  { value: tx('Bbot Interaction'), label: tx('Does app have chatbot interaction?'), tooltip: tx('An example would be interaction with a virtual character.') },
  {
    value: tx('Bio Feedback with Sense Data'),
    label: tx('Does app have passive feedback with sense data?'),
    tooltip:
      tx('The app uses passive data to provide feedback/recommendations (an app that will recommend more breathing exercises to respond to high heart rate, for example).')
  },
  {
    value: tx('Identify New Conditions'),
    label: tx('Does app claim to identify new conditions?'),
    tooltip: tx('The app claims to identify new conditions.')
  }
];

// Requests were made to change certain hard coded values.  This handles this display logic
export const withReplacement = text =>
  text === 'Is PHI shared'
    ? tx('PHI shared')
    : text === 'Is PHI Shared'
    ? tx('PHI shared')
    : text === 'Kids Help Phone Approved'
    ? tx('Youth')
    : text === 'Bbot Interaction'
    ? tx('Chatbot Interaction')
    : text === 'Use Warning'
    ? tx('Claims to Not Replace Care')
    : text === 'Is Anonymized/Aggregate Data Shared'
    ? tx('Aggregated Data Shared')
    : text === 'Is De-Identified Data Shared'
    ? tx('De-Identified/Anonymized Data Shared')
    : text === 'Biodata'
    ? tx('Passive Data')
    : text === 'Bio Feedback with Sense Data'
    ? tx('Passive Data with Sense Data')
    : text;

export const FeatureImages = [
  { value: tx('Track Mood'), label: tx('Mood Tracking'), image: '/images/newsmile.png' },
  { value: tx('Journaling'), label: tx('Journaling'), image: '/images/newbook.png' },
  //{ value: tx('Mindfulness'), label: tx('Mindfulness'), image: '/images/newflower.png' },
  { value: tx('Peer Support'), label: tx('Peer Support'), image: '/images/newpeople.png' },
  { value: tx('Psychoeducation'), label: tx('Psychoeducation'), image: '/images/newlightbulb.png' },
  { value: tx('Track Medication'), label: tx('Medication Tracking'), image: '/images/newpill.png' },
  { value: tx('Track Sleep'), label: tx('Sleep Tracking'), image: '/images/newzzz.png' }
  //{ value: tx('CBT'), label: tx('Cognitive Behavioral Therapy'), image: '/images/newmind.png' }
];

export const Features = FeatureQuestions.map(fq => fq.value as Feature);

export type Condition =
  | 'ADD/ADHD'
  | 'Mood Disorders'
  | 'Bipolar Disorder'
  | 'Cardiovascular Health'
  | 'Stress & Anxiety'
  | 'Sleep'
  | 'Phobias'
  | 'OCD'
  | 'Schizophrenia'
  | 'Eating Disorders'
  | 'Personality Disorders'
  | 'Self-Harm'
  | 'PTSD'
  | 'Substance Use'
  | 'Substance Use (Alcohol)'
  | 'Substance Use (Smoking & Tobacco)'
  | 'Headache'
  | 'Pain'
  | 'Non-Specific'
  | 'Perinatal Depression';

export const Conditions: Condition[] = [
  tx('ADD/ADHD'),
  tx('Mood Disorders'),
  tx('Bipolar Disorder'),
  tx('Cardiovascular Health'),
  tx('COPD'),
  tx('Stress & Anxiety'),
  tx('Sleep'),
  tx('Phobias'),
  tx('OCD'),
  tx('Schizophrenia'),
  tx('Eating Disorders'),
  tx('Personality Disorders'),
  tx('Self-Harm'),
  tx('PTSD'),
  tx('Substance Use'),
  tx('Substance Use (Alcohol)'),
  tx('Substance Use (Smoking & Tobacco)'),
  tx('Headache'),
  tx('Pain'),
  tx('Non-Specific'),
  tx('Perinatal Depression')
].sort(sortAscendingToLower) as Condition[];

export type DeveloperType = 'Government' | 'For Profit Company' | 'Non-Profit Company' | 'Healthcare Company' | 'Academic Institution';

export const DeveloperTypeQuestions = [
  { value: tx('Government'), label: tx('Does it come from the government?') },
  { value: tx('For Profit Company'), short: tx('For Profit'), label: tx('Does it come from a for-profit company?') },
  { value: tx('Non-Profit Company'), short: tx('Non-Profit'), label: tx('Does it come from a non-profit company?') },
  { value: tx('Healthcare Company'), short: tx('Healthcare'), label: tx('Does it come from a trusted healthcare company?') },
  { value: tx('Academic Institution'), short: tx('Academic'), label: tx('Does it come from an academic institution?') }
];

export const DeveloperTypes: DeveloperType[] = DeveloperTypeQuestions.map(dtq => dtq.value as DeveloperType);

//export type Use = 'BIDMC' | 'Self Help' | 'Reference' | 'Hybrid' | 'Kids Help Phone Approved';
export type Use = 'Self Help' | 'Reference' | 'Hybrid' | 'Kids Help Phone Approved' | 'Available in Canada';

export const UseQuestions = [
  /*{
    value: tx('BIDMC'),
    label: tx('Used in App Recommendation Study?')
  },*/
  {
    value: tx('Self Help'),
    label: tx('Is app a self-help/self-managment tool?'),
    tooltip: tx('Provides activities that can be used for self-help and self-management, such as mood or symptom tracking or mindfulness exercises.')
  },
  {
    value: tx('Reference'),
    label: tx('Is app a reference app?'),
    tooltip: tx('Provides information and references but not necessarily activites.  Psychoeducation first.')
  },
  {
    value: tx('Hybrid'),
    label: tx('Intended for hybrid use with a clinician and treatment plan?'),
    tooltip:
      tx('Is the app intended to be used as an adjunct to care? Apps that have built-in methods of connecting with a provider meet this criteria. However, a teletherapy app would not be intended for hybrid care, as the app replaces in-person care.')
  },
  {
    value: tx('Kids Help Phone Approved'),
    label: tx('Was the app approved by Kids Help Phone?'),
    tooltip: tx('Kids Help Phone is a nonprofit organization in Canada who focuses on digital mental health support for youth.')
  },
  {
    value: tx('Available in Canada'),
    label: tx('Is app available in Canada?'),
    tooltip: tx('Is app available in Canada?')
  }
];

export const Uses = UseQuestions.map(uq => uq.value as Use);

// Legacy Uses value, kept in sync from the Canada country answer until we confirm no other organization still reads it
export const LegacyCanadaUse: Use = 'Available in Canada';

export type Country = 'Canada' | 'France' | 'UK' | 'Germany';

export const CountryQuestions = [
  { value: tx('Canada'), label: tx('Is the app available in Canada?'), tooltip: tx('Can someone in Canada download and use the app?') },
  { value: tx('France'), label: tx('Is the app available in France?'), tooltip: tx('Can someone in France download and use the app?') },
  { value: tx('UK'), label: tx('Is the app available in the UK?'), tooltip: tx('Can someone in the United Kingdom download and use the app?') },
  { value: tx('Germany'), label: tx('Is the app available in Germany?'), tooltip: tx('Can someone in Germany download and use the app?') }
];

export const Countries = CountryQuestions.map(cq => cq.value as Country);

// Uses shown in filters, chips and the rating form; the legacy Canada value is superseded by Country Availability
export const VisibleUses = Uses.filter(u => u !== LegacyCanadaUse);
export const VisibleUseQuestions = UseQuestions.filter(uq => uq.value !== LegacyCanadaUse);

const hasLegacyCanadaUse = (app: { uses?: string[] }) => (app?.uses ?? []).includes(LegacyCanadaUse);

// Effective countries for filtering/display: until the backfill migration runs, apps tagged with the legacy
// Canada use (and never given a countries answer) still count as available in Canada
export const getAppCountries = (app: { countries?: string[]; uses?: string[] }): Country[] =>
  Array.isArray(app?.countries) ? (app.countries as Country[]) : hasLegacyCanadaUse(app) ? ['Canada'] : [];

// Keeps the legacy Canada use in sync with the Canada country answer when a rating is saved.
// Records without a countries answer are left untouched so their legacy value is preserved.
export const syncLegacyCanadaUse = <T extends { countries?: string[]; uses?: string[] }>(app: T): T => {
  if (!Array.isArray(app?.countries)) return app;
  const uses = (app.uses ?? []).filter(u => u !== LegacyCanadaUse);
  return { ...app, uses: app.countries.includes('Canada') ? [...uses, LegacyCanadaUse] : uses };
};

// Saved/persisted filters from before Country Availability may select the now-hidden legacy Canada use;
// move that selection to the Canada country so it stays visible and editable
export const migrateLegacyFilters = (filters: any) => {
  const uses: string[] | undefined = filters?.Uses;
  if (!Array.isArray(uses) || !uses.includes(LegacyCanadaUse)) return filters;
  const countries: string[] = Array.isArray(filters.Countries) ? filters.Countries : [];
  return {
    ...filters,
    Uses: uses.filter(u => u !== LegacyCanadaUse),
    Countries: countries.includes('Canada') ? countries : [...countries, 'Canada']
  };
};

export default interface Application {
  _id: string;
  _rev: string;
  groupId: string; // groupId for app so we can track the rating/approval chain more easily
  name: string;
  company: string;
  icon: string;
  androidLink: string;
  iosLink: string;
  webLink: string;

  outputs: Output[]; //OutputQuestions
  platforms: Platform[];
  functionalities: Functionality[]; //FunctionalityQuestions
  uses: Use[]; //UseQuestions
  countries?: Country[]; //CountryQuestions (undefined on records rated before Country Availability)
  privacies: Privacy[]; // PrivacyQuestions
  treatmentApproaches: TreatmentApproach[]; // TreatmentApproachQuestions
  features: Feature[]; // FeatureQuestions
  engagements: Engagement[]; // EngagementQuestions
  costs: Cost[]; // CostQuestions
  developerTypes: DeveloperType[]; //DeveloperTypeQuestions
  inputs: Input[]; // InputQuestions

  clinicalFoundations: ClinicalFoundation[]; // ClinicalFoundationQuestions
  conditions: Condition[]; // Conditions (no value just value)

  androidStore: AndroidStoreProps; // Meta information from the store
  appleStore: AppleStoreProps; // Meta information from the store
  readingLevel: number; // Reading level of the privacy policy (what grade reading level)?
  feasibilityStudies: number; // How many feasibility/usability studies?
  feasibilityStudiesLink: string;
  feasibilityImpact: number; // What is the highest feasibility impact factor?
  efficacyStudies: number; // How many evidence/efficacy studies?
  efficacyStudiesLink: string; // How many evidence/efficacy studies?
  efficacyImpact: number; //What is the highest efficacy impact factor?
  review: string;
  email: string; // User's email
  uid: string; // Uid for user
  approverEmail: string; // User's email who approved
  parent: any; // If object was created from a parent, keep the link to it
  created: number;
  updated: number;
  delete: boolean; // If set to true item has been deleted, keep in database
  approved: boolean;
  draft: boolean;
}
