import * as React from 'react';
import { Grid, Typography, Box, IconButton, useTheme } from '@mui/material';
import * as Icons from '@mui/icons-material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useFullScreen } from '../../../hooks';
import appEvaluationModel from '../../../images/appEvaluationModel.webp';
import QuestionSample from './QuestionSample';
import * as ExploreQuestionsDialog from '../../application/GenericDialog/ExploreQuestions';
import DialogButton from '../../application/GenericDialog/DialogButton';
import ReactPlayer from 'react-player';
import videoPath from '../../../content/zoom_1.mp4';
import videoPath2 from '../../../content/zoom_0.mp4';
import videoPath3 from '../../../content/Intro.mp4';

const padding = 32;
const width = 300;
// Section-internal gaps use CSS gap (below), not MUI Grid spacing — spacing's
// negative left margin eats into the band's left padding asymmetrically.
const headerSpacing = 0;

const getMobilePadding = breakpoints => ({
  padding,
  gap: 24,
  // The app has no global border-box, so width:100% + padding overflows the
  // right edge without this — visible on any band with a painted background.
  boxSizing: 'border-box' as any,
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
      background: `linear-gradient(135deg, ${palette.primary.dark} 0%, ${palette.primary.main} 70%, ${palette.primary.light} 130%)`,
      color: palette.common.white,
      borderRadius: 12,
      ...getMobilePadding(breakpoints)
    },
    whiteHeader: {
      background: palette.common.white,
      color: palette.primary.dark,
      ...getMobilePadding(breakpoints)
    },
    greyHeader: {
      background: '#F7F9FC',
      border: '1px solid #E5EAF0',
      borderRadius: 12,
      color: palette.primary.dark,
      ...getMobilePadding(breakpoints)
    },
    primaryText: {
      fontSize: 28,
      fontWeight: 800,
      letterSpacing: '-0.02em',
      color: palette.primary.dark
    },
    primaryLightText: {
      fontSize: 28,
      fontWeight: 800,
      letterSpacing: '-0.02em',
      color: palette.primary.dark
    },
    primaryLight: {
      color: palette.primary.dark
    },
    primaryTextSmall: {
      fontSize: 19,
      lineHeight: 1.6,
      color: palette.text.secondary
    },
    white: {
      color: palette.common.white
    },
    whiteHeading: {
      fontSize: 28,
      fontWeight: 800,
      letterSpacing: '-0.02em',
      color: palette.common.white
    }
  })
);

export default function FrameworkQuestions() {
  const classes = useStyles();
  var sm = useFullScreen('sm');
  const theme = useTheme();
  const [videoIndex, setVideoIndex] = React.useState(0);

  const Framework = (
    <Grid container className={classes.whiteHeader} spacing={headerSpacing}>
      <Grid item style={{ width }}>
        <Typography className={classes.primaryText}>Framework</Typography>
      </Grid>
      <Grid item xs>
        <Typography className={classes.primaryTextSmall}>
          There are an estimated ten thousand mental health apps available today, offering a range of possibilities from connection with a clinician to symptom
          monitoring. Apps can be useful in care, but it's important to be cautious about choosing a suitable app.
        </Typography>
      </Grid>
    </Grid>
  );

  const HowChoose = (
    <Box>
      <Grid container className={classes.greyHeader} spacing={headerSpacing}>
        <Grid item style={{ width }}>
          <Typography className={classes.primaryLightText}>How do you choose the right app?</Typography>
        </Grid>
        <Grid item xs>
          <Typography variant='body1' display='inline' color='textPrimary' style={{ fontSize: 17 }}>
            So how do you choose an app from the many options? The best way is to start by identifying your priorities: how do you want to engage with the app?
            What features are you looking for? Is there a particular standard of privacy you are seeking? Recognizing that app choice is a personal decision
            based on many individual factors,{' '}
          </Typography>
          <Typography variant='body1' display='inline' color='textPrimary' style={{ fontSize: 17, fontWeight: 700 }}>
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
        <Typography variant='body1' color='textPrimary' style={{ fontSize: 17 }}>
          The United States Food and Drug Administration (FDA) has taken a "hands-off" approach towards regulating apps. This lack of oversight means that not
          all available apps are safe and effective, and some may even pose significant dangers to users.
        </Typography>
        <Box mt={4}>
          <ul style={{ margin: 0, paddingLeft: 20, color: theme.palette.text.secondary }}>
            <Grid container spacing={4}>
              {[
                'Many claims made by apps have not been evaluated in feasibility or efficacy trials.',
                'Some apps may even sell personal data without clearly disclosing it to users.',
                'Apps may offer incorrect or misleading information, including potentially harmful recommendations.  Without stringent regulations, some apps may not securely protect the personal information that they collect.',
                'Apps continue to emerge and evolve, there are still many unknowns about the efficacy of technology-based interventions.'
              ].map((text, i) => (
                <Grid key={`text1-${i}`} item xs={sm ? 12 : 6}>
                  <li>
                    <Typography variant='body1' color='textSecondary'>
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
        <Typography variant='body1' color='textPrimary' style={{ fontSize: 17 }}>
          Each app's entry in the database is informed by 105 objective questions based on the American Psychiatric Association's App Evaluation Model, which
          introduces Accessibility, Privacy & Security, Clinical Foundation, Engagement Style, and Interoperability as major categories to consider.
        </Typography>
        <Box textAlign='center' p={4}>
          <img
            style={{ maxWidth: '100%', height: 'auto', maxHeight: 420 }}
            src={appEvaluationModel}
            alt='app-evaluation-model'
          />
        </Box>
        <Box mt={4}>
          <ol style={{ margin: 0, paddingLeft: 20, color: theme.palette.text.secondary }}>
            <Grid container spacing={4}>
              {[
                'Accessibility: Is the app accessible for a user?',
                'Privacy & Security: Does the app uphold user safety, security, and privacy by protecting data?',
                'Clinical Foundation: Is the app supported by research?',
                'Engagement Style: Is the app usable and customizable?',
                'Data Sharing Towards Therapeutic Goal: How easily can the app share data in a clinically meaningful way?'
              ].map((text, i) => (
                <Grid key={`text2-${i}`} item xs={sm ? 12 : 6}>
                  <li style={{ paddingLeft: 4 }}>
                    <Typography variant='body1' color='textSecondary'>
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
        <Typography variant='body1' color='textPrimary' style={{ fontSize: 17 }}>
          While the APA model provides a useful model through which to consider health apps and make informed decisions, it may be overwhelming for a single
          clinician during a short clinical visit to attempt to rigorously analyze the many apps that may be relevant to an individual with a particular
          condition and preferences. To make this framework functional and actionable for the public use, we adapted the questions for inclusion in a database,
          ultimately including 105 objective questions.
        </Typography>
        <Box mt={4}>
          <Typography variant='body1' color='textPrimary' style={{ fontSize: 17 }}>
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
    <Box>
      <Grid container justifyContent='space-evenly' className={classes.greyHeader} spacing={headerSpacing}>
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
        ].map(({ title, background, rows }, i) => (
          <Grid key={`text3-${i}`} item style={{ width: 280 }}>
            <QuestionSample title={title} background={background} rows={rows} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const ExploreQuestions = (
    <Grid container className={classes.header} justifyContent='center'>
      <Grid item xs={12} style={{ textAlign: 'center' }}>
        <Typography className={classes.whiteHeading}>Explore the Questions</Typography>
        <Typography style={{ marginTop: 8, fontSize: 17, maxWidth: 640, margin: '8px auto 0' }} variant='body1' className={classes.white}>
          See all 105 objective questions used to evaluate every app in the database.
        </Typography>
        <Box mt={3}>
          <DialogButton variant='primaryButton' tooltip='' Module={ExploreQuestionsDialog}>
            View the Questions
          </DialogButton>
        </Box>
      </Grid>
    </Grid>
  );

  const videos = [
    {
      title: 'Introductory Video',
      description: `With over 10,000 mental health apps available to download on the apple/google play store, it can be overwhelming to choose which one is right for you. This website is designed to make finding the right mental health app simple and easy! Please review this instructional video for information regarding this website.`,
      url: videoPath3
    },
    {
      title: 'Instructional Video',
      description:
        'Rating an app is an interactive process. Raters will be prompted through 105 different questions about an app and its features, privacy settings, clinical foundation, and more.',
      url: videoPath2
    },
    {
      title: 'Actionable App Evaluation',
      description: 'Objective Standards to Guide Assessment and Implementation of Digital Health Interventions.',
      url: videoPath
    }
  ];
  const video = videos[videoIndex];

  const Videos = (
    <Grid container className={classes.whiteHeader} spacing={headerSpacing}>
      <Grid item xs={12}>
        <Typography className={classes.primaryText}>Video Resources</Typography>
      </Grid>
      <Grid item xs={12}>
        <Box style={{ maxWidth: 720, margin: '0 auto' }}>
          <Box style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 12, overflow: 'hidden', background: '#101826' }}>
            <ReactPlayer
              key={video.url}
              url={video.url}
              controls={true}
              width='100%'
              height='100%'
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
          </Box>
          <Grid container alignItems='center' wrap='nowrap' spacing={1} style={{ marginTop: 8 }}>
            <Grid item>
              <IconButton
                aria-label='previous video'
                disabled={videoIndex === 0}
                onClick={() => setVideoIndex(i => Math.max(0, i - 1))}
                size='large'
              >
                <Icons.ChevronLeft />
              </IconButton>
            </Grid>
            <Grid item xs style={{ textAlign: 'center' }}>
              <Typography variant='h6' className={classes.primaryLight}>
                {video.title}
              </Typography>
              <Typography variant='body2' color='textSecondary'>
                {video.description}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton
                aria-label='next video'
                disabled={videoIndex === videos.length - 1}
                onClick={() => setVideoIndex(i => Math.min(videos.length - 1, i + 1))}
                size='large'
              >
                <Icons.ChevronRight />
              </IconButton>
            </Grid>
          </Grid>
          <Box style={{ textAlign: 'center', marginTop: 4 }}>
            {videos.map((v, i) => (
              <IconButton key={v.title} size='small' aria-label={`video ${i + 1}`} onClick={() => setVideoIndex(i)}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    display: 'inline-block',
                    background: i === videoIndex ? theme.palette.primary.main : theme.palette.grey[300]
                  }}
                />
              </IconButton>
            ))}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );

  return (
    // Centering lives on this wrapper — putting margin on the Grid container
    // itself would cancel the negative-margin compensation MUI uses for item
    // spacing and skew all content to the left.
    <Box style={{ maxWidth: 1160, margin: '0 auto', padding: sm ? 8 : 24 }}>
      {/* Row-only spacing: horizontal grid spacing + this app's content-box
          sizing produces asymmetric gutters. */}
      <Grid container justifyContent='center' rowSpacing={sm ? 1 : 4}>
        {[Framework, HowChoose, AppRegulation, ReviewApproach, ObjectiveQuestions, QuestionSamples, ExploreQuestions, Videos].map((C, i) => (
          <Grid key={`gi-${i}`} item xs={12}>
            {C}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
