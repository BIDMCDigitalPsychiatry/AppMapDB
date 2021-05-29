import * as React from 'react';
import { Grid, Typography, createStyles, makeStyles, Box, useTheme } from '@material-ui/core';
import { useFullScreen } from '../../../hooks';
import appEvaluationModel from '../../../images/appEvaluationModel.webp';
import QuestionSample from './QuestionSample';
import * as ExploreQuestionsDialog from '../../application/GenericDialog/ExploreQuestions';
import DialogButton from '../../application/GenericDialog/DialogButton';
import ReactPlayer from 'react-player';
import { useWidth } from '../../layout/store';
const videoPath = require('../../../content/zoom_1.mp4').default;
const videoPath2 = require('../../../content/zoom_0.mp4').default;

const padding = 32;
const width = 300;
const headerSpacing = 3;

const getMobilePadding = breakpoints => ({
  padding,
  fontWeight: 900,
  [breakpoints.down('sm')]: {
    padding: getPadding('sm')
  },
  [breakpoints.down('xs')]: {
    padding: getPadding('xs')
  }
});

const getPadding = (bp, multiplier = 1) => (bp === 'sm' ? padding / 2 : bp === 'xs' ? padding / 3 : padding) * multiplier;

const useStyles = makeStyles(({ breakpoints, palette }: any) =>
  createStyles({
    header: {
      background: palette.primary.light,
      color: palette.common.white,
      fontWeight: 900,
      ...getMobilePadding(breakpoints)
    },
    whiteHeader: {
      background: palette.common.white,
      color: palette.primary.dark,
      fontWeight: 900,
      ...getMobilePadding(breakpoints)
    },
    greyHeader: {
      background: palette.secondary.light,
      color: palette.primary.light,
      fontWeight: 900,
      ...getMobilePadding(breakpoints)
    },
    primaryText: {
      fontSize: 32,
      fontWeight: 900,
      color: palette.primary.dark
    },
    primaryLightText: {
      fontSize: 32,
      fontWeight: 900,
      color: palette.primary.light
    },
    primaryLight: {
      color: palette.primary.light
    },
    primaryTextSmall: {
      fontSize: 22,
      color: palette.primary.dark
    },
    white: {
      color: palette.common.white
    }
  })
);

export default function FrameworkQuestionsV2() {
  const classes = useStyles();
  var sm = useFullScreen('sm');
  const theme = useTheme();
  const vw = useWidth();

  const Framework = (
    <Grid container className={classes.whiteHeader} spacing={headerSpacing}>
      <Grid item style={{ width }}>
        <Typography className={classes.primaryText}>Framework</Typography>
      </Grid>
      <Grid item xs>
        <Typography className={classes.primaryTextSmall}>
          There are an estimated ten thousand mental health apps available today, offering a range of possibilities from connection with a clinicain to symptom
          monitoring. Apps can be useful in care, but it's important to be cautious about choosing a suitable app.
        </Typography>
      </Grid>
    </Grid>
  );

  const m = 4;
  const HowChoose = (
    <Box m={m}>
      <Grid container className={classes.greyHeader} spacing={headerSpacing}>
        <Grid item style={{ width: width - m * 8 }}>
          <Typography className={classes.primaryLightText}>How do you choose the right app?</Typography>
        </Grid>
        <Grid item xs>
          <Typography variant='h6' display='inline' color='textPrimary'>
            So how do you choose an app from the many options? The best way is to start by identifying your priorities: how do you want to engage with the app?
            Whate features are you looking for? Is there a particular standard of privacy you are seeking? Recognizing that app choice is a personal decision
            based on many individual factors,{' '}
          </Typography>
          <Typography variant='h6' display='inline' color='textPrimary' style={{ fontWeight: 900 }}>
            the goal of this database is to equip users with the information necessary to make a decision based on the app characteristics that matter most to
            them.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );

  const AppRegulation = (
    <Grid container className={classes.whiteHeader} spacing={headerSpacing}>
      <Grid item style={{ width }}>
        <Typography className={classes.primaryText}>App Regulation</Typography>
      </Grid>
      <Grid item xs>
        <Typography variant='h6' color='textPrimary'>
          The United States Food and Drug Administration (FDA) has taken a "hands-off" approach towards regulating apps. This lack of oversight means that not
          all available apps are safe and effective, and some may even pose significant dangers to users.
        </Typography>
        <Box mt={4}>
          <ul style={{ fontSize: 19, fontWeight: 500, color: theme.palette.text.secondary }}>
            <Grid container spacing={4}>
              {[
                'Many claims made by apps have not been evaluated in feasibility or efficacy trials.',
                'Some apps may even sell personal data without clearly disclosing it to users.',
                'Apps may offer incorrect or misleading information, including potentially harmful recommendations.  Without stringent regulations, some apps may not securely protect the personal information that they collect.',
                'Apps continue to emerge and evolve, there are still many unknowns about the efficacy of technology-based interventions.'
              ].map(text => (
                <Grid item xs={sm ? 12 : 6}>
                  <li>
                    <Typography variant='h6' color='textSecondary'>
                      {text}
                    </Typography>
                  </li>
                </Grid>
              ))}
            </Grid>
          </ul>
        </Box>
      </Grid>
    </Grid>
  );

  const ReviewApproach = (
    <Grid container className={classes.whiteHeader} spacing={headerSpacing}>
      <Grid item style={{ width }}>
        <Typography className={classes.primaryText}>Our review approach</Typography>
      </Grid>
      <Grid item xs>
        <Typography variant='h6' color='textPrimary'>
          Each app's entry in the database is informed by 105 objective questions based on the American Psychiatric Association's App Evaluation Model, which
          introduces Accessibility, Privacy & Security, Clinical Foundation, Engagement Style, and Interoperability as major categories to consider.
        </Typography>
        <Box textAlign='center' p={4}>
          <img
            style={{
              height: 400
            }}
            src={appEvaluationModel}
            alt='app-evaluation-model'
          />
        </Box>
        <Box mt={4}>
          <ol style={{ fontSize: 19, fontWeight: 500, color: theme.palette.text.secondary }}>
            <Grid container spacing={4}>
              {[
                'Accessibility: Is the app accessible for a user?',
                'Privacy & Security: Does the app uphold user safety, security, and privacy by protecting data?',
                'Clinical Foundation: Is the app supported by research?',
                'Engagement Style: Is the app usable and customizable?',
                'Data Sharing Towards Therapeutic Goal: How easily can the app share data in a clinically meaningful way?'
              ].map(text => (
                <Grid item xs={sm ? 12 : 6}>
                  <li style={{ paddingLeft: 4 }}>
                    <Typography variant='h6' color='textSecondary'>
                      {text}
                    </Typography>
                  </li>
                </Grid>
              ))}
            </Grid>
          </ol>
        </Box>
      </Grid>
    </Grid>
  );

  const ObjectiveQuestions = (
    <Grid container className={classes.whiteHeader} spacing={headerSpacing}>
      <Grid item style={{ width }}>
        <Typography className={classes.primaryText}>105 Objective Questions</Typography>
      </Grid>
      <Grid item xs>
        <Typography variant='h6' color='textPrimary'>
          While the APA model provides a useful model through which to consider health apps and make informed decisions, it may be overwhelming for a single
          clinician during a short clinical visit to attempt to rigorously analyze the many apps that may be relevant to an individual with a particular
          condition and preferences. To make this framework functional and actionable for the public use, we adapted the questions for inclusion in a database,
          ultimately including 105 objective questions.
        </Typography>
        <Box mt={4}>
          <Typography variant='h6' color='textPrimary'>
            While answering 105 questions about an app is of course not a rapid process, the end product of an easily searchable and updatable database enabling
            users to immediately sort apps according to the presence or absence of different features relevant to each unique clinical case is appealing. As
            with the APA model, there is no single score assigned to an app; rather, the database enables customization in consideration of various app aspects.
            A user of the database will not have to sort through the 105 questions and will instead see an easily interpretable view of app attributes.
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );

  const QuestionSamples = (
    <Box m={4}>
      <Grid container justify='space-evenly' className={classes.greyHeader} spacing={headerSpacing}>
        <Grid item xs={12}>
          <Typography className={classes.primaryLightText}>Question Samples</Typography>
        </Grid>
        {[
          {
            title: 'Accessibility',
            background: '#2278CF',
            rows: ['Who is the app developer?', 'How much does the app cost?', 'Does it work offline and with accessibility features?']
          },
          {
            title: 'Privacy and Security',
            background: '#EA447B',
            rows: ['Is there a privacy policy?', 'What security measures are in place?', 'What kind of user data does the app collect and is that data shared?']
          },
          {
            title: 'Inputs and Outputs',
            background: '#FABF40',
            rows: ["What are the app's inputs and outputs?", 'What information does the app take in, and what is returned to the user?']
          },
          {
            title: 'Clinical Foundation',
            background: '#31429D',
            rows: ['Is the app evidence-based?', 'Does it accomplish what it claims to do?', 'Does it work offline and with accessibility features']
          },
          {
            title: 'Engagement Style',
            background: '#D1169D',
            rows: ['What features does the app have?', 'How does a user engage with the app?']
          },
          {
            title: 'Interoperability & Sharing',
            background: '#FD4B4B',
            rows: ['Is the app able to share data with external parties, like family and providers?']
          }
        ].map(({ title, background, rows }) => (
          <Grid item style={{ width: 280 }}>
            <QuestionSample title={title} background={background} rows={rows} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const ExploreQuestions = (
    <Grid container className={classes.header} spacing={headerSpacing}>
      <Grid item xs={12}>
        <Grid container alignItems='center' alignContent='center'>
          <Grid item xs>
            <Typography className={classes.primaryText}>Explore the Questions</Typography>
            <Typography style={{ marginTop: 8 }} variant='h6' className={classes.white}>
              Want to learn more about the questions that are answered about each app in the database? View all 105 questions in this presentation.
            </Typography>
          </Grid>
          <Grid item style={{ width, textAlign: 'center' }}>
            <DialogButton variant='primaryButton' tooltip='Click to Open' Module={ExploreQuestionsDialog}>
              View Presentation
            </DialogButton>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  const Videos = (
    <Grid container justify='space-evenly' className={classes.whiteHeader} spacing={headerSpacing}>
      <Grid item xs={12}>
        <Typography className={classes.primaryText}>Video Resources</Typography>
      </Grid>
      {[
        {
          title: 'Instructional Video:',
          description:
            'Rating an app is an interactve process. Raters will be prompted through 105 different questions about an app and its features, prvacy settings, clinical foundation, and more.',
          url: videoPath2
        },
        {
          title: 'Actional App Evaluation Video:',
          description: 'Objective Standards to Guide Assessment and Implementation of Digital Health Intervations.',
          url: videoPath
        }
      ].map(({ title, description, url }) => (
        <Grid item>
          <Box style={{ width: Math.min(vw - 32, 640) }}>
            <Box pb={2}>
              <ReactPlayer url={url} controls={true} width={Math.min(vw - 32, 640)} />
            </Box>
            <Typography variant='h6' className={classes.primaryLight}>
              {title}
            </Typography>
            <Typography color='textSecondary'>{description}</Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Grid container justify='center' style={{ padding: sm ? 8 : 24 }} spacing={sm ? 1 : 4}>
      {[Framework, HowChoose, AppRegulation, ReviewApproach, ObjectiveQuestions, QuestionSamples, ExploreQuestions, Videos].map(C => (
        <Grid item>{C}</Grid>
      ))}
    </Grid>
  );
}
