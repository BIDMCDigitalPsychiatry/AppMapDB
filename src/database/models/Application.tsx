import Nano from 'nano';
import { AndroidStoreProps } from '../../components/application/DialogField/AndroidStore';
import { AppleStoreProps } from '../../components/application/DialogField/AppleStore';

export type Platform = 'Android' | 'iOS' | 'Web';
export const Platforms: Platform[] = ['Android', 'iOS', 'Web'];

export type Cost = 'Totally Free' | 'In-App Purchase' | 'Payment' | 'Subscription';
export const Costs: Cost[] = ['Totally Free', 'In-App Purchase', 'Payment', 'Subscription'];

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
  | 'Own Your Own Data'
  | 'Meets HIPPA';

export const Privacies: Privacy[] = [
  'Has Privacy Policy',
  'Data Stored on Device',
  'Data Stored on Server',
  'Can Delete Data',
  'App Declares Data Use and Purpose',
  'App Reports Security Measures in Place',
  'Is PHI Shared',
  'Is De-Identified Data Shared',
  'Is Anonymized/Aggregate Data Shared',
  'Can Opt Out of Data Collection',
  'Own Your Own Data',
  'Meets HIPPA'
];

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

export type Functionality = 'Offline' | 'Accessibility' | 'Email or Export Your Data' | 'Send Your Data to a Medical Record';
export const Functionalities: Functionality[] = ['Offline', 'Accessibility', 'Email or Export Your Data', 'Send Your Data to a Medical Record'];

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

export type DeveloperType = 'Government' | 'For Profit Company' | 'Non Profit/Healthcare Company' | 'Academic Institution';
export const DeveloperTypes: DeveloperType[] = ['Government', 'For Profit Company', 'Non Profit/Healthcare Company', 'Academic Institution'];

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
  respondToHarm: boolean; // Is the app equipped to respond to potential harms or safety concerns?
  readingLevel: number; // Reading level of the privacy policy (what grade reading level)?
  thirdPartyVendors: boolean; // Does the app use 3rd party vendors (i.e. google analytics, etc)?
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
