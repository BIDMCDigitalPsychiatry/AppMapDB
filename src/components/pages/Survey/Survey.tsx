import * as React from 'react';
import { Grid, Typography, createStyles, makeStyles, Box, Divider, Button } from '@material-ui/core';
import { useFullScreen } from '../../../hooks';
import TextLabel from '../../application/DialogField/TextLabel';
import WholeNumber from '../../application/DialogField/WholeNumber';
import AutoCompleteSelect from '../../application/DialogField/AutoCompleteSelect';
import RadioRow from '../../application/DialogField/RadioRow';
import { useChangeRoute, useUserEmail } from '../../layout/hooks';
import useSurvey from './useSurvey';
import { useRouteState } from '../../layout/store';
import ViewAppHeader from '../ViewAppHeader';

const width = 300;

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    whiteHeader: {
      background: palette.common.white,
      color: palette.primary.dark,
      fontWeight: 900
    },
    primaryText: {
      fontSize: 32,
      fontWeight: 900,
      color: palette.primary.dark
    },
    primaryTextMedium: {
      fontSize: 18,
      fontWeight: 700,
      color: palette.primary.dark
    }
  })
);

const Step0 = ({ state, onChange, errors = {} }) => {
  const questions = {
    'What is your email address?': {},
    'Have you contracted COVID-19 before?': {
      Field: RadioRow,
      items: [
        { value: 'No', label: 'No' },
        { value: 'Yes', label: 'Yes' },
        { value: 'Maybe but not confirmed', label: 'Maybe but not confirmed' }
      ]
    },
    'Were you hospitalized as a result of COVID-19 infection?': {
      Field: RadioRow,
      items: [
        { value: 'No', label: 'No' },
        { value: 'Yes', label: 'Yes' }
      ]
    },
    'If you were diagnosed with COVID-19, or if you think you contracted COVID-19 at any point, approximately what were the dates of your illness?': {},
    'What is your age in years?': {
      Field: WholeNumber,
      min: 1,
      max: 130
    },
    'What is your gender?': {
      Field: AutoCompleteSelect,
      items: [
        { value: 'Prefer not to say', label: 'Prefer not to say' },
        { value: 'Female', label: 'Female' },
        { value: 'Male', label: 'Male' },
        { value: 'Gender non-binary', label: 'Gender non-binary' },
        { value: 'Other', label: 'Other' }
      ]
    },
    'How would you describe yourself?': {
      Field: AutoCompleteSelect,
      items: [
        { value: 'American Indian or Alaskan Native', label: 'American Indian or Alaskan Native' },
        { value: 'Asian', label: 'Asian' },
        { value: 'Black or African American', label: 'Black or African American' },
        { value: 'Latinx', label: 'Latinx' },
        { value: 'Native Hawaiian or Pacific Islander', label: 'Native Hawaiian or Pacific Islander' },
        { value: 'White', label: 'White' },
        { value: 'Other', label: 'Other' }
      ]
    }
  };

  return (
    <>
      {Object.keys(questions).map(label => {
        const { Field = TextLabel, ...other } = questions[label];
        return (
          <Box mt={2} key={label}>
            <Field label={label} value={state[label]} onChange={onChange(label)} {...other} />
          </Box>
        );
      })}
    </>
  );
};

const items = [
  { value: 'Not at all', label: 'Not at all' },
  { value: 'Several days', label: 'Several days' },
  { value: 'More than half the days', label: 'More than half the days' },
  { value: 'Nearly every day', label: 'Nearly every day' }
];

const items2 = [
  { value: 'Not difficult at all', label: 'Not difficult at all' },
  { value: 'Somewhat difficult', label: 'Somewhat difficult' },
  { value: 'Very difficult', label: 'Very difficult' },
  { value: 'Extremely difficult', label: 'Extremely difficult' }
];

const items3 = [
  { value: 'Strongly disagree', label: 'Strongly disagree' },
  { value: 'Disagree', label: 'Disagree' },
  { value: 'Neutral', label: 'Neutral' },
  { value: 'Agree', label: 'Agree' },
  { value: 'Strongly agree', label: 'Strongly agree' }
];

const Step1 = ({ state, onChange, errors = {} }) => {
  const classes = useStyles();

  const questions = {};
  [
    'Little interest or pleasure in doing things?',
    'Feeling down, depressed, or hopeless',
    'Trouble falling or staying asleep, or sleeping too much?',
    'Feeling tired or having little energy?',
    'Poor appetitie or overeating?',
    'Feeling bad about yourself - or that you are a failure or have let yourself or your family down?',
    'Trouble concentrating on things, such as reading the newspaper or watching television?',
    'Moving or speaking so slowly that other people could have noticed.  Or the opposite; being so fidgety or restless that you have been moving around a lot more than usual?',
    'Thoughts that you would be better off dead, or thoughts of hurting yourself in some way?'
  ].forEach(qt => (questions[qt] = { Field: RadioRow, items }));

  questions[
    'If you checked off any problems on this questionnaire, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?'
  ] = {
    Field: RadioRow,
    items: items2
  };

  return (
    <Box mt={2}>
      <Typography className={classes.primaryTextMedium}>Over the past 2 weeks, how often have you been bothered by:</Typography>
      {Object.keys(questions).map(label => {
        const { Field = TextLabel, ...other } = questions[label];
        return (
          <Box mt={2} key={label}>
            <Field label={label} value={state[label]} onChange={onChange(label)} error={errors[label]} {...other} />
          </Box>
        );
      })}
    </Box>
  );
};

const Step2 = ({ state, onChange, errors = {} }) => {
  const classes = useStyles();

  const questions = {};
  [
    'Feeling nervous, anxious, or on edge',
    'Not being able to stop or control worrying',
    'Worrying too much about different things',
    'Trouble relaxing',
    `Being so restless that it's hard to sit still`,
    'Becoming easily annoyed or irritable',
    'Feeling afraid as if something awful might happen'
  ].forEach(qt => (questions[qt] = { Field: RadioRow, items }));

  questions[
    'If you checked off any problems on this questionnaire, how difficult have these made it for you to do your work, take care of things at home, or get along with other people?'
  ] = {
    Field: RadioRow,
    items: items2
  };

  return (
    <Box mt={2}>
      <Typography className={classes.primaryTextMedium}>Over the past 2 weeks, how often have you been bothered by:</Typography>
      {Object.keys(questions).map(label => {
        const { Field = TextLabel, ...other } = questions[label];
        return (
          <Box mt={2} key={label}>
            <Field label={label} value={state[label]} onChange={onChange(label)} error={errors[label]} {...other} />
          </Box>
        );
      })}
    </Box>
  );
};

const Step3 = ({ state, onChange, errors = {} }) => {
  const questions = {};
  [
    'I think that I would like to use this app frequently.',
    'I found this app unnecessarily complex.',
    'I thought this app was easy to use.',
    'I think that I would need the support of a technical person to be able to use this app.',
    'I found the various functions to be well integrated in this app.',
    'I thought there was too much inconsistency in this app.',
    'I would imagine that most people would learn to use this app very quickly.',
    'I found this app to be very cumbersome (awkward) to use.',
    'I felt very confident using this app.',
    'I needed to learn a lot of things before I could get going with this app.'
  ].forEach(qt => (questions[qt] = { Field: RadioRow, items: items3 }));

  return (
    <Box mt={2}>
      {Object.keys(questions).map(label => {
        const { Field = TextLabel, ...other } = questions[label];
        return (
          <Box mt={2} key={label}>
            <Field label={label} value={state[label]} onChange={onChange(label)} error={errors[label]} {...other} />
          </Box>
        );
      })}
    </Box>
  );
};

const Step4 = ({ state, onChange, errors = {} }) => {
  const questions = {};
  [
    'I trust this app to guide me towards my personal goals.',
    'I believe this app tasks will help me to address my problem.',
    'This app encourages me to accomplish tasks and make progress.',
    'I agree that the tasks within this app are important for my goals.',
    'This app is easy to use and operate.',
    'This app supports me to overcome challenges.'
  ].forEach(qt => (questions[qt] = { Field: RadioRow, items: items3 }));

  return (
    <Box mt={2}>
      {Object.keys(questions).map(label => {
        const { Field = TextLabel, ...other } = questions[label];
        return (
          <Box mt={2} key={label}>
            <Field label={label} value={state[label]} onChange={onChange(label)} error={errors[label]} {...other} />
          </Box>
        );
      })}
    </Box>
  );
};

const validateStep0 = values => {
  const newErrors = {};
  return newErrors;
};

const validateStep1 = values => {
  const newErrors = {};
  return newErrors;
};

const validateStep2 = values => {
  const newErrors = {};
  return newErrors;
};

const validateStep3 = values => {
  const newErrors = {};
  return newErrors;
};

const validateStep4 = values => {
  const newErrors = {};
  return newErrors;
};

const Steps = [Step0, Step1, Step2, Step3, Step4];
const validations = [validateStep0, validateStep1, validateStep2, validateStep3, validateStep4];

export default function Survey() {
  const classes = useStyles();
  var sm = useFullScreen('sm');

  const [app] = useRouteState();

  const changeRoute = useChangeRoute();

  const { handleSave, errors } = useSurvey();
  const email = useUserEmail();

  const [state, setState] = React.useState({
    step: 0,
    errors: {},
    'What is your email address?': email // if user is logged in, auto fill the email field
  });

  const handleChange = React.useCallback(
    key => event => {
      const value = event?.target?.value;
      setState(prev => ({ ...prev, [key]: value, errors: {} }));
    },
    [setState]
  );

  const validate = validations[state.step];

  const handleNext = () => {
    const newErrors = validate(state);
    if (Object.keys(newErrors).length > 0) {
      setState(prev => ({ ...prev, errors: newErrors }));
    } else {
      document.getElementById('app-content')?.scrollTo({ top: 0, behavior: 'smooth' });
      setState(prev => ({ ...prev, step: prev.step + 1 }));
    }
  };

  const handleSubmit = () => {
    handleSave({
      values: { ...state, app },
      validate,
      onError: errors => console.error('Error submiting survey', errors),
      onSuccess: () => {
        console.log('Successfully saved survey');
        changeRoute('/ViewApp', { ...app, fromRoute: 'Survey' });
      }
    });
  };

  const handleBack = () => {
    document.getElementById('app-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    setState(prev => ({ ...prev, step: prev.step > 0 ? prev.step - 1 : 0 }));
  };

  const Step = Steps[state.step];

  return (
    <Grid container justify='center' style={{ padding: sm ? 8 : 24 }} spacing={sm ? 1 : 4}>
      <Grid item>
        <Grid container className={classes.whiteHeader} spacing={1}>
          <Grid item style={{ width }} xs={12}>
            <Grid container alignItems='flex-end' justify='space-between'>
              <Grid item>
                <Typography className={classes.primaryText}>{`Survey`}</Typography>
              </Grid>
              <Grid item>
                <Typography className={classes.primaryTextMedium}>{`${state.step + 1} of ${Steps.length}`}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <Box mt={2} mb={2}>
            <ViewAppHeader app={app} type='survey' />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <Step state={state} onChange={handleChange} errors={errors} />
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2} style={{ marginTop: 16 }} justify='flex-end'>
            {state.step > 0 && (
              <Grid item>
                <Button variant='contained' color='primary' onClick={handleBack}>
                  Back
                </Button>
              </Grid>
            )}
            <Grid item>
              {state.step === Steps.length - 1 ? (
                <Button variant='contained' color='primary' onClick={handleSubmit}>
                  Submit
                </Button>
              ) : (
                <Button variant='contained' color='primary' onClick={handleNext}>
                  Next
                </Button>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
