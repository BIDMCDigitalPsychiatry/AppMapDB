import Nano from 'nano';
import { AndroidStoreProps } from '../../components/application/DialogField/AndroidStore';
import { AppleStoreProps } from '../../components/application/DialogField/AppleStore';
import { AddToQueue } from '@material-ui/icons';

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

export type ClinicalFoundation = 'Does What it Claims' | 'Patient Facing' | 'Can Cause Harm' | 'Supporting Studies' | 'Use Warning';

export const ClinicalFondationQuestions = [
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
  | 'Chat/Message Board'
  | 'Real Time Response'
  | 'Asynchronous Response'
  | 'Gamification (Points, Badges)'
  | 'Videos'
  | 'Audio/Music/Scripts'
  | 'Bio Feedback'
  | 'AI Support'
  | 'Peer Support'
  | 'Network Support'
  | 'Collaborative With Provider/Other';

export const Engagements: Engagement[] = [
  'Chat/Message Board',
  'Real Time Response',
  'Asynchronous Response',
  'Gamification (Points, Badges)',
  'Videos',
  'Audio/Music/Scripts',
  'Bio Feedback',
  'AI Support',
  'Peer Support',
  'Network Support',
  'Collaborative With Provider/Other'
];

export type Functionality =
  | 'Works with Spanish'
  | 'Works Offline'
  | 'Works with Accessibility Features'
  | 'Own Your Own Data'
  | 'Email or Export Your Data'
  | 'Send Your Data to a Medical Record';

export const FunctionalityQuestions = [
  { value: 'Works with Spanish', label: 'Does the app work with Spanish?', tooltip: 'Test it on the app itself and confirm via the app store.' },
  { value: 'Works Offline', label: 'Does the app work offline?', tooltip: 'Does the app work in airplane mode?' },
  {
    value: 'Works with Accessibility Features',
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
export const Inputs: Input[] = ['Surveys', 'Diary', 'Geolocation', 'Contact List', 'Camera', 'Microphone', 'Step Count', 'External Devices', 'Social Network'];

export type Output =
  | 'Notifications'
  | 'Refernces/Information'
  | 'Social Network'
  | 'Reminders'
  | 'Graphs of Data'
  | 'Summary of Data'
  | 'Link to Formal Care/Coaching';

export const Outputs: Output[] = [
  'Notifications',
  'Refernces/Information',
  'Social Network',
  'Reminders',
  'Graphs of Data',
  'Summary of Data',
  'Link to Formal Care/Coaching'
];

export type Feature =
  | 'Track Symptoms'
  | 'Chatbot/AI'
  | 'Assessments/Screenings'
  | 'CBT'
  | 'Mindfulness'
  | 'Journaling'
  | 'Productivity'
  | 'Peer Support'
  | 'Physical Health'
  | 'Track Mood'
  | 'Track Medication'
  | 'Track Sleep'
  | 'Psychoeducation'
  | 'Deep Breathing'
  | 'ACT'
  | 'DBT'
  | 'Biodata'
  | 'Coach/Therapist Connection'
  | 'Goal Setting/Habits'
  | 'Physical Health Excersizes'
  | 'Picture Gallery/Hope Board'
  | 'iCBT or Sleep Therapy'
  | 'Bbot Interaction'
  | 'Bio Feedback with Sense Data';

export const Features = [
  'Track Symptoms',
  'Chatbot/AI',
  'Assessments',
  'CBT',
  'Mindfulness',
  'Journaling',
  'Productivity',
  'Peer Support',
  'Physical Health',
  'Track Mood',
  'Track Medication',
  'Track Sleep',
  'Psychoeducation',
  'Deep Breathing',
  'ACT',
  'DBT',
  'Biodata',
  'Coach/Therapist Connection',
  'Goal Setting/Habits',
  'Physical Health Excersizes',
  'Picture Gallery/Hope Board',
  'iCBT or Sleep Therapy',
  'Bbot Interaction',
  'Bio Feedback with Sense Data'
];

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

export type DeveloperType = 'Government' | 'For Profit Company' | 'Healthcare Company' | 'Academic Institution';

export const DeveloperTypeQuestions = [
  { value: 'Government', label: 'Does it come from the government?' },
  { value: 'For Profit Company', label: 'Does it come from a for-profit company?' },
  { value: 'Healthcare Company', label: 'Does it come from a trusted healthcare company?' },
  { value: 'Academic Institution', label: 'Does it come from an academic institution?' }
];

export const DeveloperTypes: DeveloperType[] = DeveloperTypeQuestions.map(dtq => dtq.value as DeveloperType);

export default interface Application extends Nano.MaybeDocument {
  name: string;
  company: string;
  icon: string;
  androidLink: string;
  iosLink: string;
  webLink: string;
  platforms: Platform[];
  developerType: DeveloperType[];
  costs: Cost[];
  conditions: Condition[];
  privacies: Privacy[];
  clinicalFoundation: ClinicalFoundation;
  features: Feature[];
  functionalities: Functionality[];
  inputs: Input[];
  outputs: Output[];
  engagements: Engagement[];
  androidStore: AndroidStoreProps; // Meta information from the store
  appleStore: AppleStoreProps; // Meta information from the store
  readingLevel: number; // Reading level of the privacy policy (what grade reading level)?
  correctContent: boolean; // Is the app content well-written, correct, and relevant?
  feasibilityStudies: number; // How many feasibility/usability studies?
  feasibilityImpact: number; // What is the highest feasibility impact factor?
  efficacyStudies: number; // How many evidence/efficacy studies?
  efficacyImpact: number; //What is the highest efficacy impact factor?
  selfHelp: boolean; // Is it a self-help/self-management tool?
  referenceApp: boolean; // Is it a reference app?
  hybridUse: boolean; // Is it intended for hybrid use with a clinician in conjunction with treatment plan?
  created: number;
  updated: number;
}
