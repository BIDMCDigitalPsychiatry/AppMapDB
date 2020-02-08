import Nano from 'nano';

export type Platform = 'Android' | 'iOS' | 'Web';
export const Platforms: Platform[] = ['Android', 'iOS', 'Web'];

export type Cost = 'Totally Free' | 'In-App Purchase' | 'Payment' | 'Subscription';
export const Costs: Cost[] = ['Totally Free', 'In-App Purchase', 'Payment', 'Subscription'];

export type ClinicalFoundation = 'Supporting Studies' | 'No Supporting Studies';
export const ClinicalFoundations: ClinicalFoundation[] = ['Supporting Studies', 'No Supporting Studies'];

export type Privacy = 'Has Privacy Policy' | 'Data Stored on Device' | 'Can Delete Data';
export const Privacies: Privacy[] = ['Has Privacy Policy', 'Data Stored on Device', 'Can Delete Data'];

export type Functionality = 'Offline' | 'Accessibility';
export const Functionalities: Functionality[] = ['Offline', 'Accessibility'];

export type Feature = 'Track Symptoms' | 'Chatbot/AI' | 'Assessments/Screenings' | 'CBT' | 'Mindfulness' | 'Journaling' | 'Productivity' | 'Peer Support' | 'Physical Health';
export const Features = ['Track Symptoms', 'Chatbot/AI', 'Assessments', 'CBT', 'Mindfulness', 'Journaling', 'Productivity', 'Peer Support', 'Physical Health'];

export type Condition = 'Mood Disorders' | 'Stress & Anxiety' | 'Sleep' | 'Phobias' | 'OCD' | 'Schizophrenia' | 'Eating Disorders' | 'Personality Disorders';
export const Conditions: Condition[] = ['Mood Disorders', 'Stress & Anxiety', 'Sleep', 'Phobias', 'OCD', 'Schizophrenia', 'Eating Disorders', 'Personality Disorders'];

export default interface Application extends Nano.MaybeDocument {
  name: string;
  company: string;
  platforms: Platform[];
  costs: Cost[];
  conditions: Condition[];
  privicies: Privacy[];
  clincialFoundation: ClinicalFoundation;
  features: Feature[];
  functionalities: Functionality[];
}
