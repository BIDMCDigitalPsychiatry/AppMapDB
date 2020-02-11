import Nano from 'nano';

export type Platform = 'Android' | 'iOS' | 'Web';
export const Platforms: Platform[] = ['Android', 'iOS', 'Web'];

export type Cost = 'Totally Free' | 'In-App Purchase' | 'Payment' | 'Subscription';
export const Costs: Cost[] = ['Totally Free', 'In-App Purchase', 'Payment', 'Subscription'];

export type ClinicalFoundation = 'No Supporting Studies' | 'Supporting Studies';
export const ClinicalFoundations: ClinicalFoundation[] = ['No Supporting Studies', 'Supporting Studies'];

export type Privacy = 'Has Privacy Policy' | 'Data Stored on Device' | 'Data Stored on Server' | 'Can Delete Data';
export const Privacies: Privacy[] = ['Has Privacy Policy', 'Data Stored on Device', 'Data Stored on Server', 'Can Delete Data'];

export type Functionality = 'Offline' | 'Accessibility';
export const Functionalities: Functionality[] = ['Offline', 'Accessibility'];

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
  androidLink: string;
  iosLink: string;
  webLink: string;
  platforms: Platform[];
  developerType: DeveloperType[];
  costs: Cost[];
  conditions: Condition[];
  privicies: Privacy[];
  clincialFoundation: ClinicalFoundation;
  features: Feature[];
  functionalities: Functionality[];
}
