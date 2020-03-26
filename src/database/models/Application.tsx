import Nano from 'nano';
import { AndroidStoreProps } from '../../components/application/DialogField/AndroidStore';
import { AppleStoreProps } from '../../components/application/DialogField/AppleStore';

export type Platform = 'Android' | 'iOS' | 'Web';
export const Platforms: Platform[] = ['Android', 'iOS', 'Web'];

export type Cost = 'Totally Free' | 'Free to Download' | 'In-App Purchase' | 'Payment' | 'Subscription';

export const CostQuestions = [
  { value: 'Free to Download', label: 'Is the app free to download?', tooltip: 'Some apps may be free up front but then have in app purchases.' },
  { value: 'Totally Free', label: 'Is the app totally free?', tooltip: 'No cost up front, no in app purchases.' },
  { value: 'Payment', label: 'Is there a one time payment?' },
  { value: 'In-App Purchase', label: 'Are there in-app purchases?' },
  { value: 'Subscription', label: 'Is there a subscription (recurrent/monthly/annual)?' }
];

export const Costs: Cost[] = CostQuestions.map(cq => cq.value as Cost);

export type ClinicalFoundation =
  | 'Well Written Relevant Content'
  | 'Does What it Claims'
  | 'Patient Facing'
  | 'Can Cause Harm'
  | 'Supporting Studies'
  | 'Use Warning';

export const ClinicalFondationQuestions = [
  {
    value: 'Well Written Relevant Content',
    label: 'Is the app content well-written, correct, and relevant?'
  },
  { value: 'Does What it Claims', label: 'Does the app appear to do what it claims to do?' },
  {
    value: 'Patient Facing',
    label: 'Is the app patient facing?',
    tooltip: 'Is the app relevant and intended for an individual with the condition the app relates to?'
  },
  {
    value: 'Can Cause Harm',
    label: 'Can the app cause harm?',
    tooltip:
      "Does the app make recommendations or suggestions that directly defy clinical guidelines? Does it include overtly false information, like a suicide hotline number that doesn't actually work?"
  },
  { value: 'Use Warning', label: 'Does the app provide any warning for use?' },
  { value: 'Supporting Studies', label: 'Does the app contain supporting studies?' }
];

export const ClinicalFoundations: ClinicalFoundation[] = ClinicalFondationQuestions.map(cfq => cfq.value as ClinicalFoundation);

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
  | 'Meets HIPAA'
  | 'Has Crisis Management Feature';

export const PrivacyQuestions = [
  { value: 'Has Privacy Policy', label: 'Is there a privacy policy?' },
  { value: 'Data Stored on Device', label: 'Is the data stored only on the device?' },
  { value: 'Data Stored on Server', label: 'Is the data stored on a server?' },
  { value: 'Can Delete Data', label: 'Can you delete your data?' },
  { value: 'App Declares Data Use and Purpose', label: 'Does the app declare data use and purpose?' },
  { value: 'App Reports Security Measures in Place', label: 'Does the app report security measures in place?' },
  { value: 'Is PHI Shared', label: 'Is PHI shared?' },
  { value: 'Is De-Identified Data Shared', label: 'Is de-identified data shared?' },
  { value: 'Is Anonymized/Aggregate Data Shared', label: 'Is anonymized/aggregate data shared?' },
  { value: 'Can Opt Out of Data Collection', label: 'Can you opt out of data colleciton?' },
  { value: 'Meets HIPAA', label: 'Does the app claim to meet HIPAA?' },
  {
    value: 'Has Crisis Management Feature',
    label: 'Does the app have a crisis management feature?',
    tooltip: 'An app’s emergency response or crisis management feature is often detailed in the privacy policy.'
  }
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
  { value: 'User Generated Data', label: 'User generated data?', tooltip: 'Examples include mood tracking, diary app, etc.' },
  { value: 'Chat/Message', label: 'Chat/message based?' },
  { value: 'Assessments/Screenings', label: 'Does app have have screeners/assesments?', tooltip: 'Examples include PHQ9, GAS7, etc.' },
  { value: 'Real Time Response', label: 'Real time response?', tooltip: 'Someone will reply to your chat right away.' },
  {
    value: 'Asynchronous Response',
    label: 'Asynchronous response?',
    tooltip: 'There are no immediate responses to chats. Responses come at predetermined intervals (once a day; every four hours; etc)'
  },
  { value: 'Gamification (Points/Badges)', label: 'Gamification (points, badges)?' },
  { value: 'Videos', label: 'Videos?' },
  { value: 'Audio/Music/Scripts', label: 'Audio/music/scripts?' },
  { value: 'AI Support', label: 'AI support', tooltip: 'Interaction is not with a real person but with a but.' },
  {
    value: 'Peer Support',
    label: 'Peer support?',
    tooltip: 'Peer is defined as a person with lived experience and support involves actually communicating (so not just watching a video)'
  },
  { value: 'Network Support', label: 'Network support?', tooltip: 'Network is defined as someone (like family or friend) who is actually known.' },
  {
    value: 'Collaborative With Provider/Other',
    label: 'Collaborative with provider/other?',
    tooltip: 'Does it allow for direct collaboration with a provider or clinician? Beyond just being able to share your data'
  }
];

export const Engagements: Engagement[] = EngagementQuestions.map(eq => eq.value as Engagement);

export type Functionality = 'Spanish' | 'Offline' | 'Accessibility' | 'Own Your Own Data' | 'Email or Export Your Data' | 'Send Your Data to a Medical Record';

export const FunctionalityQuestions = [
  { value: 'Spanish', label: 'Does the app work with Spanish?', tooltip: 'Test it on the app itself and confirm via the app store.' },
  { value: 'Offline', label: 'Does the app work offline?', tooltip: 'Does the app work in airplane mode?' },
  {
    value: 'Accessibility',
    label: 'Does the app work with accessibility features?',
    tooltip: 'Does the app have adjustible text size or text to voice features?'
  },
  { value: 'Own Your Own Data', label: 'Do you own your own data?' },
  { value: 'Email or Export Your Data', label: 'Can you email or export your data?' },
  {
    value: 'Send Your Data to a Medical Record',
    label: 'Can you send your data to a medical record?',
    tooltip: 'Does the app sync with EMR? Most apps are not currently equipped with connections to medical record.'
  }
];

export const Functionalities: Functionality[] = FunctionalityQuestions.map(fq => fq.value as Functionality);

export type Input = 'Surveys' | 'Diary' | 'Geolocation' | 'Contact List' | 'Camera' | 'Microphone' | 'Step Count' | 'External Devices' | 'Social Network';
export const InputQuestions = [
  { value: 'Surveys', label: 'Surveys?' },
  { value: 'Diary', label: 'Diary?' },
  { value: 'Geolocation', label: 'Geolocation?' },
  { value: 'Contact List', label: 'Contact List?' },
  {
    value: 'Camera',
    label: 'Camera?',
    tooltip: 'Do any features of the app utilize camera input? So profile picture? Or photo diary features? Or video chat?'
  },
  { value: 'Microphone', label: 'Microphone?' },
  { value: 'Step Count', label: 'Step Count?', tooltip: 'Does the app utilize step tracking?' },
  { value: 'External Devices', label: 'External Devices' },
  {
    value: 'Social Network',
    label: 'Social Network?',
    tooltip: 'Connection to social media. Does the app allow you to input social media information? For example, do you connect it to your facebook to log in?'
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
  { value: 'Notifications', label: 'Notifications?' },
  { value: 'References/Information', label: 'References/Information?' },
  {
    value: 'Social Network',
    label: 'Social Network?',
    tooltip: 'Can you post information from the app to social media? Does the app connect to social media for posting purposes?'
  },
  { value: 'Reminders', label: 'Reminders?' },
  { value: 'Graphs of Data', label: 'Graphs of Data?' },
  { value: 'Summary of Data', label: 'Summary of Data?' },
  { value: 'Link to Formal Care/Coaching', label: 'Link to Formal Care/Coaching?' }
];

export const Outputs: Output[] = [
  'Notifications',
  'References/Information',
  'Social Network',
  'Reminders',
  'Graphs of Data',
  'Summary of Data',
  'Link to Formal Care/Coaching'
];

export type Feature =
  | 'Track Mood'
  | 'Track Medication'
  | 'Track Sleep'
  | 'Physical Health'
  | 'Psychoeducation'
  | 'Journaling'
  | 'Picture Gallery/Hope Board'
  | 'Mindfulness'
  | 'Deep Breathing'
  | 'iCBT or Sleep Therapy'
  | 'CBT'
  | 'ACT'
  | 'DBT'
  | 'Peer Support'
  | 'Coach/Therapist Connection'
  | 'Biodata'
  | 'Goal Setting/Habits'
  | 'Physical Health Excersizes'
  | 'Bbot Interaction'
  | 'Bio Feedback with Sense Data';
//| 'Track Symptoms'
//| 'Productivity';

export const FeatureQuestions = [
  { value: 'Track Mood', label: 'Does app have mood tracking?' },
  { value: 'Track Medication', label: 'Does app have medication tracking?' },
  { value: 'Track Sleep', label: 'Does app have sleep tracking?' },
  { value: 'Physical Health', label: 'Does app have physical excersize tracking?' },
  {
    value: 'Psychoeducation',
    label: 'Does app have psychoeducation?',
    tooltip: 'Does app provide definitions, explanations of different diagnoses? Is it didactic?'
  },
  { value: 'Journaling', label: 'Does app have journaling?' },
  { value: 'Picture Gallery/Hope Board', label: 'Does app have a picture gallery or hope board?' },
  { value: 'Mindfulness', label: 'Does app have mindfullness?' },
  { value: 'Deep Breathing', label: 'Does app have deep breathing?' },
  { value: 'iCBT or Sleep Therapy', label: 'Does app have iCBT or sleep therapy?' },
  { value: 'CBT', label: 'Does app have CBT?' },
  { value: 'ACT', label: 'Does app have ACT?' },
  { value: 'DBT', label: 'Does app have DBT?' },
  {
    value: 'Peer Support',
    label: 'Does app have peer support?',
    tooltip: 'Does the app offer connection to peer specialists or individuals with lived experience?'
  },
  { value: 'Coach/Therapist Connection', label: 'Does have have a connection to coach/therapist?' },
  { value: 'Biodata', label: 'Does app have biodata tracking?', tooltip: 'Does it collect heart rate, skin conductance, etc.' },
  { value: 'Goal Setting/Habits', label: 'Does app have goal setting/habits?' },
  {
    value: 'Physical Health Excersizes',
    label: 'Does app have physical health excersizes?',
    tooltip: 'Something like a 7 minute workout that actually gives a workout.  This is a recommendation of exercises, NOT excersize tracking.'
  },
  { value: 'Bbot Interaction', label: 'Does app have Bbot interaction?', tooltip: 'An example would be interaction with a virtual character.' },
  {
    value: 'Bio Feedback with Sense Data',
    label: 'Does app have bio feedback with sense data?',
    tooltip: 'HRV, skin conductance etc. Puts biodata to use to provide feedback/recommendations (a lot of ASD and ADHD apps)'
  }
  //{ value: 'Track Symptoms', label: '', tooltip: '' },
  //{ value: 'Productivity', label: '', tooltip: '' },
];

export const Features = FeatureQuestions.map(fq => fq.value as Feature);

export type Condition = 'Mood Disorders' | 'Stress & Anxiety' | 'Sleep' | 'Phobias' | 'OCD' | 'Schizophrenia' | 'Eating Disorders' | 'Personality Disorders';
export const Conditions: Condition[] = [
  'Mood Disorders',
  'Stress & Anxiety',
  'Sleep',
  'Phobias',
  'OCD',
  'Schizophrenia',
  'Eating Disorders',
  'Personality Disorders'
];

export type DeveloperType = 'Government' | 'For Profit Company' | 'Non-Profit Company' | 'Healthcare Company' | 'Academic Institution';

export const DeveloperTypeQuestions = [
  { value: 'Government', label: 'Does it come from the government?' },
  { value: 'For Profit Company', label: 'Does it come from a for-profit company?' },
  { value: 'Non-Profit Company', label: 'Does it come from a non-profit company?' },
  { value: 'Healthcare Company', label: 'Does it come from a trusted healthcare company?' },
  { value: 'Academic Institution', label: 'Does it come from an academic institution?' }
];

export const DeveloperTypes: DeveloperType[] = DeveloperTypeQuestions.map(dtq => dtq.value as DeveloperType);

export type Use = 'Self Help' | 'Reference' | 'Hybrid';

export const UseQuestions = [
  { value: 'Self Help', label: 'Is app a self-help/self-managment tool?' },
  {
    value: 'Reference',
    label: 'Is app a reference app?',
    tooltip: 'Provides information and references but not necessarily activites.  Psychoeducation first.'
  },
  { value: 'Hybrid', label: 'Intended for hybrid use with a clinician and treatment plan?' }
];

export const Uses = UseQuestions.map(uq => uq.value as Use);

export default interface Application extends Nano.MaybeDocument {
  name: string;
  company: string;
  icon: string;
  androidLink: string;
  iosLink: string;
  webLink: string;
  platforms: Platform[];
  developerTypes: DeveloperType[];
  costs: Cost[];
  conditions: Condition[];
  privacies: Privacy[];
  uses: Use[];
  clinicalFoundations: ClinicalFoundation[];
  features: Feature[];
  functionalities: Functionality[];
  inputs: Input[];
  outputs: Output[];
  engagements: Engagement[];
  androidStore: AndroidStoreProps; // Meta information from the store
  appleStore: AppleStoreProps; // Meta information from the store
  readingLevel: number; // Reading level of the privacy policy (what grade reading level)?
  feasibilityStudies: number; // How many feasibility/usability studies?
  feasibilityImpact: number; // What is the highest feasibility impact factor?
  efficacyStudies: number; // How many evidence/efficacy studies?
  efficacyImpact: number; //What is the highest efficacy impact factor?
  created: number;
  updated: number;
  delete: boolean; // If set to true item has been deleted, keep in database
}
