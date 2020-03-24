import Nano from 'nano';
import { AndroidStoreProps } from '../../components/application/DialogField/AndroidStore';
import { AppleStoreProps } from '../../components/application/DialogField/AppleStore';
import { AddToQueue } from '@material-ui/icons';

export type Platform = 'Android' | 'iOS' | 'Web';
export const Platforms: Platform[] = ['Android', 'iOS', 'Web'];

export type Cost = 'Totally Free' | 'In-App Purchase' | 'Payment' | 'Subscription';

export const CostQuestions = [
  { value: 'Totally Free', label: 'Is the app totally free?' },
  { value: 'Payment', label: 'Is there a one time payment?' },
  { value: 'In-App Purchase', label: 'Are there in-app purchases?' },
  { value: 'Subscription', label: 'Is there a subscription (recurrent/monthly/annual)?' }
];

export const Costs: Cost[] = CostQuestions.map(cq => cq.value as Cost);

export type ClinicalFoundation = 'No Supporting Studies' | 'Supporting Studies';
export const ClinicalFoundations: ClinicalFoundation[] = ['No Supporting Studies', 'Supporting Studies'];

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
  { value: 'Has Crisis Management Feature', label: 'Does the app have a crisis management feature?' }
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

export type Functionality = 'Offline' | 'Accessibility' | 'Own Your Own Data' | 'Email or Export Your Data' | 'Send Your Data to a Medical Record';
export const Functionalities: Functionality[] = [
  'Offline',
  'Accessibility',
  'Own Your Own Data',
  'Email or Export Your Data',
  'Send Your Data to a Medical Record'
];

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
  doesWhatItClaims: boolean; // Does the app appear to do what it claims to do?
  correctContent: boolean; // Is the app content well-written, correct, and relevant?
  feasibilityStudies: number; // How many feasibility/usability studies?
  feasibilityImpact: number; // What is the highest feasibility impact factor?
  efficacyStudies: number; // How many evidence/efficacy studies?
  efficacyImpact: number; //What is the highest efficacy impact factor?
  causeHarm: boolean; // Can the app cause harm?
  useWarning: boolean; // Does the app provide any warning for use?
  selfHelp: boolean; // Is it a self-help/self-management tool?
  referenceApp: boolean; // Is it a reference app?
  hybridUse: boolean; // Is it intended for hybrid use with a clinician in conjunction with treatment plan?
  created: number;
  updated: number;
}
