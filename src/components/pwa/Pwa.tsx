import * as React from 'react';
import { Button, Grid, Container, LinearProgress, Divider, Collapse, Box } from '@mui/material';
import PwaApps from './PwaApps';
import PwaAppBar from './PwaAppBar';
import { useScrollElement } from '../layout/ScrollElementProvider';
import useHeight from '../layout/ViewPort/hooks/useHeight';
import { useHandleTableReset, useTableFilterUpdate, useTableFilterValue } from '../application/GenericTable/store';
import { isEmpty, stringifyEqual } from '../../helpers';
import { Conditions } from '../../database/models/Application';
import { usePwaActions, useShowResults } from './store';
import { useSelector } from 'react-redux';
import { AppState } from '../../store';
import Landing from './Landing';
import Progress from './Progress';

const SingleAnswerButtons = ({ value, onChange, onNext, options = [] }) => {
  const handleClick = React.useCallback(
    value => () => {
      onChange && onChange(value);
      onNext && onNext();
    },
    [onChange, onNext]
  );

  return (
    <Grid container spacing={2}>
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

export const questions = [
  {
    label: 'Type of device?',
    options: [
      { label: 'Apple', filterValue: ['iOS'] },
      { label: 'Android', filterValue: ['Android'] },
      { label: 'Any', filterValue: [] }
    ],
    Field: SingleAnswerButtons,
    id: 'Platforms',
    onSelect: undefined
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
    options: [
      { label: `It doesn't matter`, filterValue: [] },
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

export const searchIndex = questions.length;

const getQuestionFilters = values => {
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

export default function Pwa() {
  const index = useSelector((s: AppState) => s.pwa.index);
  const values = useSelector((s: AppState) => s.pwa.values, stringifyEqual);

  const showWelcome = index < 0 ? true : false;

  const question =
    index >= 0 && index <= questions.length - 1 ? questions[index] : { id: undefined, label: '', options: [], Field: () => <></>, onSelect: undefined };

  const { id, label, options, Field = SingleAnswerButtons, onSelect = undefined } = question;

  const value = values[index];

  const scrollEl = useScrollElement();
  const height = useHeight();
  const onReset = useHandleTableReset('Applications');

  React.useEffect(() => {
    onReset();
    // eslint-disable-next-line
  }, []);

  const scrollTop = React.useCallback(() => {
    if (scrollEl) {
      scrollEl.scrollTop = 0;
    }
    // eslint-disable-next-line
  }, [scrollEl, height]);

  const [, setValue] = useTableFilterValue('Applications', id);
  const tableFilterUpdate = useTableFilterUpdate();

  const filters = getQuestionFilters(values);
  const { change, next } = usePwaActions();

  const onChange = React.useCallback(
    index => value => {
      change({ index, value });
      if (onSelect) {
        onSelect && onSelect({ value, setValue });
      } else {
        setValue(value?.filterValue ?? []); // Set individual filter value any time it changes
      }
    },
    [change, setValue, onSelect]
  );

  const handleNext = React.useCallback(() => {
    next();
    scrollTop();
  }, [next, scrollTop]);

  const showResults = useShowResults();

  React.useEffect(() => {
    if (showResults) {
      tableFilterUpdate('Applications', filters); // Sync all filters with answer filters whenever we show the results
    }
  }, [filters, showResults, tableFilterUpdate]);

  return (
    <Container maxWidth='lg' sx={{ pt: 1, pb: 2, px: 0 }}>
      {showWelcome ? (
        <Landing />
      ) : (
        <>
          <Grid container spacing={1} alignItems='center' justifyContent='center' sx={{ px: 1 }}>
            <Grid item xs={12}>
              <PwaAppBar />
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
          </Grid>
          {showResults ? (
            <PwaApps />
          ) : (
            <Grid container spacing={1} alignItems='center' justifyContent='center' sx={{ px: 1, pt: 1 }}>
              <Grid item xs={12}>
                <Progress />
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sx={{ textAlign: 'center', fontSize: 32, color: 'primary.dark' }}>
                {label}
              </Grid>
              <Grid item xs={12} sx={{ mt: 0.5 }}>
                <Field onChange={onChange(index)} onNext={handleNext} options={options} value={value} />
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Container>
  );
}
