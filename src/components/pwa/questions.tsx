import { isEmpty } from '../../helpers';
import { Conditions } from '../../database/models/Application';
import SingleAnswerButtons from './SingleAnswerButtons';
import MultiAnswerButtons from './MultiAnswerButtons';
import { tx } from '../../i18n';

interface Question {
  label: string;
  options: { label: string; filterValue: string[] }[];
  Field?: any;
  id: string;
  appKey: string;
}

export const questions: Question[] = [
  {
    label: tx('Type of device?'),
    options: [
      { label: tx('Any'), filterValue: [] },
      { label: 'Apple', filterValue: ['iOS'] },
      { label: 'Android', filterValue: ['Android'] }
    ],
    Field: SingleAnswerButtons,
    id: 'Platforms',
    appKey: 'platforms' // key mapping to app structure
  },
  {
    label: tx('Willing to pay?'),
    options: [
      { label: tx(`It doesn't matter`), filterValue: [] },
      { label: tx('No, totally free only'), filterValue: ['Totally Free'] },
      { label: tx('Yes, can pay one time download fee'), filterValue: ['Payment'] },
      { label: tx('Yes, can pay subscription fee'), filterValue: ['Subscription'] },
      { label: tx('Yes, can pay in app payments'), filterValue: ['In-App Purchase'] }
    ],
    id: 'Cost',
    appKey: 'costs'
  },
  {
    label: tx('Need a privacy policy?'),
    id: 'Privacy',
    appKey: 'privacies',
    options: [
      { label: tx(`It doesn't matter`), filterValue: [] },
      { label: tx('Yes, only apps with privacy policies'), filterValue: ['Has Privacy Policy'] }
    ]
  },
  {
    label: tx('Need supporting evidence?'),
    id: 'ClinicalFoundations',
    appKey: 'clinicalFoundations',
    options: [
      { label: tx(`It doesn't matter`), filterValue: [] },
      //{ label: 'Supporting Evidence & Crisis Support', filterValue: ['Supporting Studies', 'Appropriately Advises Patient in Case of Emergency'] },
      { label: tx('Yes, only apps with supporting studies'), filterValue: ['Supporting Studies'] }
      //{ label: 'Crisis Support', filterValue: ['Appropriately Advises Patient in Case of Emergency'] }
    ]
  },
  {
    label: tx('Condition target?'),
    id: 'Conditions',
    appKey: 'conditions',
    options: ([{ label: tx(`It doesn't matter`), filterValue: [] }] as Question['options']).concat(
      Conditions.filter(v => v !== 'Non-Specific').map(c => ({ label: c, filterValue: [c] }))
    )
  },
  {
    label: tx('Desired treatment approach?'),
    id: 'TreatmentApproaches',
    appKey: 'treatmentApproaches',
    options: [
      { label: tx(`It doesn't matter`), filterValue: [] },
      //{ label: 'Acceptance and Commitment', filterValue: [] },
      { label: tx('Acceptance and Commitment Therapy (ACT)'), filterValue: ['ACT'] },
      { label: tx('Cognitive Behavioral Therapy (CBT)'), filterValue: ['CBT'] },
      { label: tx('Dialectical Behavioral Therapy (DBT)'), filterValue: ['DBT'] },
      { label: tx('Exercise'), filterValue: ['Physical Health Exercises'] },
      { label: tx('Insomnia Cognitive Behavioral Therapy (iCBT)'), filterValue: ['iCBT or Sleep Therapy'] },
      { label: tx('Mindfulness'), filterValue: ['Mindfulness'] }
    ]
  },
  {
    label: tx('Feature included?'),
    id: 'Features',
    appKey: 'features',
    Field: MultiAnswerButtons,
    options: [
      //{ label: `It doesn't matter`, filterValue: [] },
      { label: tx('Goal Setting'), filterValue: ['Goal Setting/Habits'] },
      { label: tx('Journaling'), filterValue: ['Journaling'] },
      { label: tx('Medication Tracking'), filterValue: ['Track Medication'] },
      { label: tx('Mood Tracking'), filterValue: ['Track Mood'] },
      { label: tx('Psychoeducation'), filterValue: ['Psychoeducation'] },
      { label: tx('Sleep Tracking'), filterValue: ['Track Sleep'] },
      { label: tx('Symptom Tracking'), filterValue: ['Track Symptoms'] }
    ]
  }
];

export const getQuestion = index => {
  const question = index >= 0 && index <= questions.length - 1 ? questions[index] : { id: undefined, label: '', options: [], Field: () => <></> };
  return question;
};

export const searchIndex = questions.length;

export const getQuestionFilters = values => {
  var filters = {};
  questions.forEach(({ id, options }, idx) => {
    //console.log({ values, idx, vidx: values[idx] });
    if (!isEmpty(values[idx]?.label)) {
      var selectedOption = options.find(o => o.label === values[idx]?.label);
      //      console.log({ selectedOption });
      if (selectedOption) {
        filters[id] = selectedOption.filterValue;
      }
    }
  });
  return filters;
};
