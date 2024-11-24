import { isEmpty } from '../../helpers';
import { Conditions } from '../../database/models/Application';
import SingleAnswerButtons from './SingleAnswerButtons';
import MultiAnswerButtons from './MultiAnswerButtons';

export const questions = [
  {
    label: 'Type of device?',
    options: [
      { label: 'Any', filterValue: [] },
      { label: 'Apple', filterValue: ['iOS'] },
      { label: 'Android', filterValue: ['Android'] }
    ],
    Field: SingleAnswerButtons,
    id: 'Platforms'
  },
  {
    label: 'Willing to pay?',
    options: [
      { label: `It doesn't matter`, filterValue: [] },
      { label: 'No, totally free only', filterValue: ['Totally Free'] },
      { label: 'Yes, can pay one time download fee', filterValue: ['Payment'] },
      { label: 'Yes, can pay subscription fee', filterValue: ['Subscription'] },
      { label: 'Yes, can pay in app payments', filterValue: ['In-App Purchase'] }
    ],
    id: 'Cost'
  },
  {
    label: 'Need a privacy policy?',
    id: 'Privacy',
    options: [
      { label: `It doesn't matter`, filterValue: [] },
      { label: 'Yes, only apps with privacy policies', filterValue: ['Has Privacy Policy'] }
    ]
  },
  {
    label: 'Need supporting evidence?',
    id: 'ClinicalFoundations',
    options: [
      { label: `It doesn't matter`, filterValue: [] },
      //{ label: 'Supporting Evidence & Crisis Support', filterValue: ['Supporting Studies', 'Appropriately Advises Patient in Case of Emergency'] },
      { label: 'Yes, only apps with supporting studies', filterValue: ['Supporting Studies'] }
      //{ label: 'Crisis Support', filterValue: ['Appropriately Advises Patient in Case of Emergency'] }
    ]
  },
  {
    label: 'Condition target?',
    id: 'Conditions',
    options: [{ label: `It doesn't matter`, filterValue: [] }].concat(Conditions.filter(v => v !== 'Non-Specific').map(c => ({ label: c, filterValue: [c] })))
  },
  {
    label: 'Desired treatment approach?',
    id: 'TreatmentApproaches',
    options: [
      { label: `It doesn't matter`, filterValue: [] },
      //{ label: 'Acceptance and Commitment', filterValue: [] },
      { label: 'Acceptance and Commitment Therapy (ACT)', filterValue: ['ACT'] },
      { label: 'Cognitive Behavioral Therapy (CBT)', filterValue: ['CBT'] },
      { label: 'Dialectical Behavioral Therapy (DBT)', filterValue: ['DBT'] },
      { label: 'Exercise', filterValue: ['Physical Health Exercises'] },
      { label: 'Insomnia Cognitive Behavioral Therapy (iCBT)', filterValue: ['iCBT or Sleep Therapy'] },
      { label: 'Mindfulness', filterValue: ['Mindfulness'] }
    ]
  },
  {
    label: 'Feature included?',
    id: 'Features',
    Field: MultiAnswerButtons,
    options: [
      //{ label: `It doesn't matter`, filterValue: [] },
      { label: 'Goal Setting', filterValue: ['Goal Setting/Habits'] },
      { label: 'Journaling', filterValue: ['Journaling'] },
      { label: 'Medication Tracking', filterValue: ['Track Medication'] },
      { label: 'Mood Tracking', filterValue: ['Track Mood'] },
      { label: 'Psychoeducation', filterValue: ['Psychoeducation'] },
      { label: 'Sleep Tracking', filterValue: ['Track Sleep'] },
      { label: 'Symptom Tracking', filterValue: ['Track Symptoms'] }
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
    console.log({ values, idx, vidx: values[idx] });
    if (!isEmpty(values[idx]?.label)) {
      var selectedOption = options.find(o => o.label === values[idx]?.label);
      console.log({ selectedOption });
      if (selectedOption) {
        filters[id] = selectedOption.filterValue;
      }
    }
  });
  return filters;
};
