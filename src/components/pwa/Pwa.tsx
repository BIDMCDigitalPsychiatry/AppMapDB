import * as React from 'react';
import { Button, Grid, Container, LinearProgress, Divider } from '@mui/material';
import PwaApps from './PwaApps';
import PwaAppBar from './PwaAppBar';
import { useScrollElement } from '../layout/ScrollElementProvider';
import useHeight from '../layout/ViewPort/hooks/useHeight';
import { useTableFilterValue } from '../application/GenericTable/store';
import { isEmpty } from '../../helpers';
import { Conditions } from '../../database/models/Application';

const SingleAnswerButtons = ({ value, onChange, onNext, options = [] }) => {
  const handleClick = React.useCallback(
    value => () => {
      onChange && onChange(value);
      onNext && onNext();
    },
    [onChange, onNext]
  );

  return (
    <Grid container spacing={3}>
      {options.map(o => (
        <Grid item xs={12}>
          <Button
            variant='contained'
            onClick={handleClick(o)}
            size='large'
            fullWidth
            sx={{ backgroundColor: value === o ? 'primary.dark' : undefined, fontSize: 24, minHeight: 64 }}
          >
            {!isEmpty(o?.label) ? o.label : o}
          </Button>
        </Grid>
      ))}
    </Grid>
  );
};

const questions = [
  {
    label: 'Type of device?',
    options: [
      { label: 'Apple', filterValue: ['iOS'] },
      { label: 'Android', filterValue: ['Android'] },
      { label: 'Both', filterValue: ['iOS', 'Android'] }
    ],
    Field: SingleAnswerButtons,
    id: 'Platforms',
    onSelect: undefined
  },
  {
    label: 'Willing to pay?',
    options: [
      { label: 'No, totally free only', filterValue: ['Totally Free'] },
      { label: 'Yes, can pay one time download fee', filterValue: ['Payment'] },
      { label: 'Yes, can pay subscription fee', filterValue: ['Subscription'] },
      { label: 'Yes, can pay in app payments', filterValue: ['In-App Purchase'] },
      { label: `It doesn't matter to me`, filterValue: [] }
    ],
    id: 'Cost'
  },
  {
    label: 'Need a privacy policy?',
    id: 'Privacy',
    options: [
      { label: 'Yes, only apps with privacy policies', filterValue: ['Has Privacy Policy'] },
      { label: `It doesn't matter to me`, filterValue: [] }
    ]
  },
  {
    label: 'Need supporting evidence and/or crisis support?',
    id: 'ClinicalFoundations',
    options: [
      { label: 'Not Required', filterValue: [] },
      { label: 'Supporting Evidence & Crisis Support', filterValue: ['Supporting Studies', 'Appropriately Advises Patient in Case of Emergency'] },
      { label: 'Supporting Evidence', filterValue: ['Supporting Studies'] },
      { label: 'Crisis Support', filterValue: ['Appropriately Advises Patient in Case of Emergency'] }
    ]
  },
  {
    label: 'Condition target?',
    id: 'Conditions',
    options: Conditions.map(c => ({ label: c, filterValue: [c] }))
    /*[
      'No Specific Condition',
      'Bipolar Disorder',
      'Cardiovascular Health',
      'COPD',
      'Eating Disorders',
      'Headache',
      'Mood Disorders',
      'OCD',
      'Pain',
      'Perinatal Depression',
      'Personality Disorders',
      'Phonbias',
      'PTSD',
      'Schizophrenia',
      'Self-Harm',
      'Sleep',
      'Stress & Anxiety',
      'Substance Use',
      'Substance Use (Alchohol)',
      'Substance Use (Smoking & Tobacco)'
    ]*/
  },
  {
    label: 'Desired treatment approach?',
    id: 'TreatmentApproaches',
    options: [
      { label: 'Nothing Specific', filterValue: [] },
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
    options: [
      { label: 'Nothing Specific', filterValue: [] },
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

const defaultState = { index: 0, backIndex: 0, values: {} };

export default function Pwa() {
  const [{ index, values }, setState] = React.useState(defaultState);

  const question = index <= questions.length - 1 ? questions[index] : { id: undefined, label: '', options: [], Field: () => <></>, onSelect: undefined };
  //console.log({ index, question });
  const searchIndex = questions.length;
  const { id, label, options, Field = SingleAnswerButtons, onSelect = undefined } = question;

  const value = values[index];

  const scrollEl = useScrollElement();
  const height = useHeight();

  const scrollTop = React.useCallback(() => {
    if (scrollEl) {
      scrollEl.scrollTop = 0;
    }
    // eslint-disable-next-line
  }, [scrollEl, height]);

  const [filterValue, setValue] = useTableFilterValue('Applications', id);
  //console.log({ id, filterValue });

  const onChange = React.useCallback(
    index => value => {
      setState(p => ({ ...p, values: { ...p.values, [index]: value } }));
      if (onSelect) {
        onSelect && onSelect({ value, setValue });
      } else {
        setValue(value?.filterValue ?? []);
      }
    },
    [setState, setValue, onSelect]
  );

  const handleNext = React.useCallback(() => {
    setState(p => ({ ...p, index: p.index + 1, backIndex: p.index }));
    scrollTop();
  }, [setState, scrollTop]);

  const handleBack = React.useCallback(() => {
    //setState(p => ({ ...p, index: p?.index > 0 ? p.index - 1 : 0 }));
    setState(p => ({ ...p, index: p?.backIndex, backIndex: p.backIndex > 0 ? p.backIndex - 1 : 0 }));
    scrollTop();
  }, [setState, scrollTop]);

  const handleSearch = React.useCallback(() => {
    setState(p => ({ ...p, index: searchIndex, backIndex: p.index }));
    scrollTop();
  }, [setState, searchIndex, scrollTop]);

  const handleReset = React.useCallback(() => {
    setState(defaultState);
    scrollTop();
  }, [setState, scrollTop]);

  var progress = (100 * (index + 1)) / questions?.length;

  const showResults = index >= searchIndex ? true : false;

  return (
    <Container maxWidth='lg' sx={{ py: 5 }}>
      <Grid container spacing={2} alignItems='center' justifyContent='center'>
        <PwaAppBar
          handleBack={handleBack}
          handleNext={handleNext}
          handleSearch={handleSearch}
          disableBack={index <= 0}
          hideNext={showResults}
          hideSearch={showResults}
          handleReset={handleReset}
        />
        <Grid item xs={12}>
          <Divider />
        </Grid>
        {showResults ? (
          <>
            <PwaApps />
          </>
        ) : (
          <>
            <Grid item xs={12}>
              <Grid container spacing={1} alignItems='center'>
                <Grid item xs>
                  <LinearProgress value={progress} variant='determinate' sx={{ height: 12, borderRadius: 5 }} />
                </Grid>
                <Grid item sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                  {index + 1} / {questions.length}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12} sx={{ textAlign: 'center', fontSize: 32, color: 'primary.dark' }}>
              {label}
            </Grid>
            <Grid item xs={12}>
              <Field onChange={onChange(index)} onNext={handleNext} options={options} value={value} />
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  );
}
