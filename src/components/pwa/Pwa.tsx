import * as React from 'react';
import { Button, Grid, Container, LinearProgress, Divider } from '@mui/material';
import PwaApps from './PwaApps';
import PwaAppBar from './PwaAppBar';

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
            {o}
          </Button>
        </Grid>
      ))}
    </Grid>
  );
};

const questions = [
  { label: 'Type of device?', filter: 'Platform', options: ['Apple', 'Android', 'Both'], Field: SingleAnswerButtons },
  {
    label: 'Willing to pay?',
    filter: 'Cost',
    options: ['No, totally free only', 'Yes, can pay one time download fee', 'Yes, can pay subscription fee/in app payments', `It doesn't matter to me`]
  },
  { label: 'Need a privacy policy?', filter: 'Privacy', options: ['Yes, only apps with privacy policies', `It doesn't matter to me`] },
  { label: 'Need supporting evidence?', filter: 'Evidence & Clinical Foundations', options: ['Yes', `Not a requirement`] },
  { label: 'Need crisis support?', filter: 'Evidence & Clinical Foundations', options: ['Yes', `Not a requirement`] },
  {
    label: 'Condition target?',
    filter: 'Supported Conditions',
    options: [
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
    ]
  },
  {
    label: 'Desired treatment approach?',
    filter: 'Treatment Approaches',
    options: [
      'Nothing Specific',
      'Acceptance and Commitment',
      'Acceptance and Commitment Therapy (ACT)',
      'Cognitive Behavioral Therapy (CBT)',
      'Dialectical Behavioral Therapy (DBT)',
      'Excersize',
      'Insomnia Cognitive Behavioral Therapy (iCBT)',
      'Mindfulness'
    ]
  },
  {
    label: 'Feature included?',
    filter: 'Features',
    options: ['Nothing Specific', 'Goal Setting', 'Journaling', 'Medication Tracking', 'Mood Tracking', 'Psychoeducation', 'Sleep Tracking', 'Symptom Tracking']
  }
];

const defaultState = { index: 0, values: {} };

export default function Pwa() {
  const [{ index, values }, setState] = React.useState(defaultState);

  const question = index <= questions.length - 1 ? questions[index] : { label: '', options: [], Field: () => <></> };
  console.log({ index, question });
  const searchIndex = questions.length;
  const { label, options, Field = SingleAnswerButtons } = question;

  const value = values[index];

  const onChange = React.useCallback(
    index => value => {
      setState(p => ({ ...p, values: { ...p.values, [index]: value } }));
    },
    [setState]
  );

  const handleNext = React.useCallback(() => {
    setState(p => ({ ...p, index: p.index + 1 }));
  }, [setState]);

  const handleBack = React.useCallback(() => {
    setState(p => ({ ...p, index: p?.index > 0 ? p.index - 1 : 0 }));
  }, [setState]);

  const handleSearch = React.useCallback(() => {
    setState(p => ({ ...p, index: searchIndex }));
  }, [setState, searchIndex]);

  const handleReset = React.useCallback(() => {
    setState(defaultState);
  }, [setState]);

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
