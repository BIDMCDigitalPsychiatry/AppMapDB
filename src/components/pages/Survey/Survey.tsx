import * as React from 'react';
import { Grid, Typography, createStyles, makeStyles, Box, Divider, Button } from '@material-ui/core';
import { useFullScreen } from '../../../hooks';
import TextLabel from '../../application/DialogField/TextLabel';
import MultiSelectCheck from '../../application/DialogField/MultiSelectCheck';
import RadioRow from '../../application/DialogField/RadioRow';
import { useChangeRoute, useHandleChangeRoute, useUserEmail } from '../../layout/hooks';
import useSurvey from './useSurvey';
import { useRouteState } from '../../layout/store';
import ViewAppHeader from '../ViewAppHeader';
import { publicUrl } from '../../../helpers';
import { sendSurveyEmail, sendSurveyNotificationEmail } from './sendSurveyEmail';
import { getAppName } from '../../application/GenericTable/Applications/selectors';

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

const Step0 = ({ state, onChange, errors = {}, disabled = false }) => {
  const questions = {
    'What is the best email address we can reach you at?': {},
    'Sex (assigned at birth)?': {
      Field: RadioRow,
      items: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Intersex', label: 'Intersex' }
      ]
    },
    'Gender Identity?': {
      Field: RadioRow,
      items: [
        { value: 'Female', label: 'Female' },
        { value: 'Male', label: 'Male' },
        { value: 'Non-binary', label: 'Non-binary' },
        { value: 'Transgender female', label: 'Transgender female' },
        { value: 'Transgender male', label: 'Transgender male' },
        { value: 'Other', label: 'Other' }
      ]
    },
    'Race?': {
      Field: RadioRow,
      items: [
        { value: 'African-American', label: 'African-American' },
        { value: 'American Indian or Alaskan Native', label: 'American Indian or Alaskan Native' },
        { value: 'Asian', label: 'Asian' },
        { value: 'Native Hawaiian or other Pacific Islander', label: 'Native Hawaiian or other Pacific Islander' },
        { value: 'White', label: 'White' },
        { value: 'Other', label: 'Other' }
      ]
    },
    'Ethnicity?': {
      Field: RadioRow,
      items: [
        { value: 'Hispanic or Latino/a', label: 'Hispanic or Latino/a' },
        { value: 'Not Hispanic or Latino/a', label: 'Not Hispanic or Latino/a' }
      ]
    },
    'Annual household income?': {
      Field: RadioRow,
      items: [
        { value: 'Less than $25,000', label: 'Less than $25,000' },
        { value: '$25,000-$59,000', label: '$25,000-$59,000' },
        { value: '$60,000-$84,000', label: '$60,000-$84,000' },
        { value: '$85,000-$99,000', label: '$85,000-$99,000' },
        { value: '$100,000+', label: '$100,000+' }
      ]
    },
    'Is this your first time attending therapy?': {
      Field: RadioRow,
      items: [
        { value: 'Yes', label: 'Yes' },
        { value: 'No', label: 'No' }
      ]
    },
    'How much school have you completed?': {
      Field: RadioRow,
      required: true,
      items: [
        { value: 'Eighth grade or less', label: 'Eighth grade or less' },
        { value: 'Some high school', label: 'Some high school' },
        { value: 'High school graduate/GED', label: 'High school graduate/GED' },
        { value: 'Some college', label: 'Some college' },
        { value: '4-year college graduate or higher', label: '4-year college graduate or higher' }
      ]
    }
  };

  const classes = useStyles();

  return (
    <Box mt={2}>
      <Typography className={classes.primaryTextMedium}>Demographics:</Typography>
      {Object.keys(questions).map(label => {
        const { Field = TextLabel, ...other } = questions[label];
        return (
          <Box mt={2} key={label}>
            <Field label={label} value={state[label]} onChange={onChange(label)} disabled={disabled} {...other} />
          </Box>
        );
      })}
    </Box>
  );
};

const yesNoItems = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' }
];

const phoneItems = [
  { value: 'Apple (iPhone)', label: 'Apple (iPhone)' },
  { value: 'Google', label: 'Google' },
  { value: 'Samsung', label: 'Samsung' },
  { value: 'LG', label: 'LG' },
  { value: 'Motorola', label: 'Motorola' },
  { value: 'HTC', label: 'HTC' },
  { value: 'Other', label: 'Other' },
  { value: `I don't own a smartphone`, label: `I don't own a smartphone` }
];

const comfortableItems = [
  { value: 'I cannot do it on my own', label: 'I cannot do it on my own' },
  { value: 'I can do it on my own, but with step by step instructions', label: 'I can do it on my own, but with step by step instructions' },
  { value: 'I can do it mostly on my own, but may have a few questions', label: 'I can do it mostly on my own, but may have a few questions' },
  { value: 'I can do it on my own with ease', label: 'I can do it on my own with ease' },
  { value: 'I can do it and teach someone else', label: 'I can do it and teach someone else' }
];

const items3 = [
  { value: 'Strongly disagree', label: 'Strongly disagree' },
  { value: 'Disagree', label: 'Disagree' },
  { value: 'Neutral', label: 'Neutral' },
  { value: 'Agree', label: 'Agree' },
  { value: 'Strongly agree', label: 'Strongly agree' }
];

const items4 = [
  { value: 'Not at all true', label: 'Not at all true' },
  { value: 'Hardly true', label: 'Hardly true' },
  { value: 'Moderately true', label: 'Moderately true' },
  { value: 'Exactly true', label: 'Exactly true' }
];

const Step1 = ({ state, onChange, errors = {}, disabled = false }) => {
  const classes = useStyles();

  const questions = {};
  questions['What is the make of your phone?'] = {
    Field: RadioRow,
    items: phoneItems
  };

  questions['What is the model of your phone? (eg. 8, XR, Galaxy S8, Pixel 4, etc.)'] = {};

  ['How comfortable are you connecting your phone to Wi-Fi?', 'How comfortable are you downloading an app from the app store'].forEach(
    qt => (questions[qt] = { Field: RadioRow, items: comfortableItems })
  );

  questions['Have you used a smartphone app for your mental health in the past?'] = {
    Field: RadioRow,
    items: yesNoItems
  };

  questions['If yes, which app?'] = {};

  return (
    <Box mt={2}>
      <Typography className={classes.primaryTextMedium}>Technology Usage:</Typography>
      {Object.keys(questions).map(label => {
        const { Field = TextLabel, ...other } = questions[label];
        return (
          <Box mt={2} key={label}>
            <Field label={label} value={state[label]} onChange={onChange(label)} error={errors[label]} disabled={disabled} {...other} />
          </Box>
        );
      })}
    </Box>
  );
};

const Step2 = ({ state, onChange, errors = {}, disabled = false }) => {
  const classes = useStyles();

  const questions = {};
  ['Do you have health insurance?', 'Have you been diagnosed with a mental illness?'].forEach(qt => (questions[qt] = { Field: RadioRow, items: yesNoItems }));

  return (
    <Box mt={2}>
      <Typography className={classes.primaryTextMedium}>Access to Health</Typography>
      {Object.keys(questions).map(label => {
        const { Field = TextLabel, ...other } = questions[label];
        return (
          <Box mt={2} key={label}>
            <Field label={label} value={state[label]} onChange={onChange(label)} error={errors[label]} disabled={disabled} {...other} />
          </Box>
        );
      })}
    </Box>
  );
};

const Step3 = ({ state, onChange, errors = {}, disabled = false }) => {
  const questions = {};

  questions['Which filters were most important to you when choosing a mobile app?'] = {
    Field: MultiSelectCheck,
    items: [
      'Cost',
      'Developer type (e.g. for-profit, non-profit, healthcare company, academic institution)',
      'Supported Condition (e.g. anxiety, sleep, OCD, mood disorder, substance use, etc.)',
      'Functionality (e.g. available in Spanish, functions offline, email or export data, etc.)',
      'Uses (e.g. self-help, reference, hybrid)',
      'Features (e.g. track mood, journaling, mindfulness, CBT, peer support, chatbot, etc.)',
      'Engagements (e.g. user generated data, messaging, gamification, network support, etc.)',
      'Evidence & Clinical Foundations (e.g. patient facing, risk of harm, warning, supporting studies, etc.)',
      'Privacy (e.g. has privacy policy, delete data, personal health information shared, meets HIPAA, etc.)'
    ].map(value => ({ value, label: value }))
  };

  questions['Did outside factors impact your app decision (e.g. star ratings, reviews)?'] = {
    Field: RadioRow,
    items: yesNoItems
  };

  questions['If yes, which specific aspects?'] = {};

  const classes = useStyles();

  return (
    <Box mt={2}>
      <Typography className={classes.primaryTextMedium}>App Selection Information</Typography>
      {Object.keys(questions).map(label => {
        const { Field = TextLabel, ...other } = questions[label];
        return (
          <Box mt={2} key={label}>
            <Field label={label} value={state[label]} onChange={onChange(label)} error={errors[label]} disabled={disabled} {...other} />
          </Box>
        );
      })}
    </Box>
  );
};

const Step4 = ({ state, onChange, errors = {}, disabled = false }) => {
  const questions = {};
  [
    'I think that I would like to use Recommended App frequently.',
    'I found Recommended App unnecessarily complex.',
    'I thought Recommended App was easy to use.',
    'I think that I wouldn eed the support of a technical person to be able to use Recommended App.',
    'I found the various functions in Recommended App were well integrated.',
    'I thought there was too much inconsistency in Recommended App.',
    'I would imagine that most people would learn to use Recommended App very quickly.',
    'I found Recommended App very cumbersome (akward) to use.',
    'I felt very confident using Recommended App.',
    'I needed to learn a lot of things before I could get going with Recommended App.'
  ].forEach(qt => (questions[qt] = { Field: RadioRow, items: items3 }));

  return (
    <Box mt={2}>
      {Object.keys(questions).map(label => {
        const { Field = TextLabel, ...other } = questions[label];
        return (
          <Box mt={2} key={label}>
            <Field label={label} value={state[label]} onChange={onChange(label)} error={errors[label]} disabled={disabled} {...other} />
          </Box>
        );
      })}
    </Box>
  );
};

const Step5 = ({ state, onChange, errors = {}, disabled = false }) => {
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
            <Field label={label} value={state[label]} onChange={onChange(label)} error={errors[label]} disabled={disabled} {...other} />
          </Box>
        );
      })}
    </Box>
  );
};

const Step6 = ({ state, onChange, errors = {}, disabled = false }) => {
  const questions = {};
  [
    'I can always manage to solve difficult problems if I try hard enough.',
    'If someone opposes me, I can find the means and ways to get what I want.',
    'It is easy for me to stick to my aims and accomplish my goals.',
    'I am confident that I could deal efficiently with unexpected events.',
    'Thanks to my resourcefulness, I know how to handle unforeseen situations.',
    'I can solve most problems if I invest the necessary effort.',
    'I can remain calm when facing difficulties because I can rely on my coping abilities',
    'When I am confirted with a problem, I can usually find several solutions.',
    'If I am in trouble, I can usually think of a solution.',
    'I can usually handle whatever comes my way.'
  ].forEach(qt => (questions[qt] = { Field: RadioRow, items: items4 }));

  return (
    <Box mt={2}>
      {Object.keys(questions).map(label => {
        const { Field = TextLabel, ...other } = questions[label];
        return (
          <Box mt={2} key={label}>
            <Field label={label} value={state[label]} onChange={onChange(label)} error={errors[label]} disabled={disabled} {...other} />
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

const validateStep5 = values => {
  const newErrors = {};
  return newErrors;
};

const validateStep6 = values => {
  const newErrors = {};
  return newErrors;
};

const Steps = [Step0, Step1, Step2, Step3, Step4, Step5, Step6];
const validations = [validateStep0, validateStep1, validateStep2, validateStep3, validateStep4, validateStep5, validateStep6];

export default function Survey() {
  const classes = useStyles();
  var sm = useFullScreen('sm');

  const { handleSave, getRow, errors } = useSurvey();
  const email = useUserEmail();

  const [state, setState] = React.useState({
    step: 0,
    errors: {},
    'What is the best email address we can reach you at?': email // if user is logged in, auto fill the email field
  });

  const surveyEmail = state['What is the best email address we can reach you at?'];

  const [routeState] = useRouteState();
  const { _id, surveyId, app = {}, mode } = routeState;

  React.useEffect(() => {
    if (mode === 'view') {
      getRow(_id, result => {
        setState(prev => ({ ...prev, ...result?.Item, step: 0 }));
      });
    }
    // eslint-disable-next-line
  }, [_id, JSON.stringify(app), mode, getRow, setState]);

  const changeRoute = useChangeRoute();

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
    const created = new Date().getTime();
    handleSave({
      values: { ...state, parentId: surveyId, created, updated: created, app },
      validate,
      onError: errors => console.error('Error submiting survey', errors),
      onSuccess: () => {
        console.log('Successfully saved survey');
        sendSurveyEmail({ email: surveyEmail });
        sendSurveyNotificationEmail({ email: surveyEmail, appName: getAppName(app) });
        changeRoute(publicUrl('/ViewApp'), { app, from: 'Survey' });
      }
    });
  };

  const handleBack = () => {
    document.getElementById('app-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    setState(prev => ({ ...prev, step: prev.step > 0 ? prev.step - 1 : 0 }));
  };

  const Step = Steps[state.step];

  const disabled = mode === 'view';

  const handleChangeRoute = useHandleChangeRoute();

  return (
    <Grid container justify='center' style={{ padding: sm ? 8 : 24 }} spacing={sm ? 1 : 4}>
      <Grid item>
        <Grid container className={classes.whiteHeader} spacing={1}>
          {mode === 'view' && (
            <Grid item xs={12} style={{ cursor: 'pointer' }} onClick={handleChangeRoute(publicUrl('/Admin'), { subRoute: 'surveys' })}>
              <Typography>{`<   Back To Surveys`}</Typography>
            </Grid>
          )}
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
          <Step state={state} onChange={handleChange} errors={errors} disabled={disabled} />
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
                <Button disabled={disabled} variant='contained' color='primary' onClick={handleSubmit}>
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
