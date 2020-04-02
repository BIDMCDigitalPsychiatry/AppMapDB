import * as React from 'react';
import { Typography, Box, Container, Grid, makeStyles, createStyles, Divider } from '@material-ui/core';
import { useFullScreen } from '../../hooks';
import DialogButton from '../application/GenericDialog/DialogButton';
import originFunctionality from '../../images/originfunctionality.png';
import engagementStyle from '../../images/engagementstyle.png';
import privacySecurity from '../../images/privacysecurity.png';
import inputsOutputs from '../../images/inputsoutputs.png';
import clinicalFoundation from '../../images/clinicalfoundation.png';
import interoperabilitySharing from '../../images/interoperabilitysharing.png';
import * as GenericObjectiveQuestionDialog from '../application/GenericDialog/ObjectiveQuestions/GenericObjectiveQuestionDialog';

const useStyles = makeStyles(() =>
  createStyles({
    root: {},
    header: { maxWidth: 800 },
    button: {
      height: 60,
      width: 175
    }
  })
);

const buttons = [
  {
    title: 'Origin and Functionality',
    img: originFunctionality,
    questions: ['Who is the app developer?', 'How much does the app cost?', 'Does it work offline and with accessibility features?']
  },
  {
    title: 'Privacy and Security',
    img: privacySecurity,
    questions: ['Is there a privacy policy?', 'What security measures are in place?', 'What kind of user data does the app collect and is that data shared?']
  },
  {
    title: 'Inputs and Outputs',
    img: inputsOutputs,
    questions: ["What are the app's inputs and outputs?", 'What information does the app take in, and what is returned to the user?']
  },
  { title: 'Clinical Foundation', img: clinicalFoundation, questions: ['Is the app evidence-based?', 'Does it accomplish what it claims to do?'] },
  { title: 'Engagement Style', img: engagementStyle, questions: ['What features does the app have?', 'How does a user engage with the app?'] },
  {
    title: 'Interoperability and Sharing',
    img: interoperabilitySharing,
    questions: ['Is the app able to share data with external parties, like family and providers?']
  }
];

export default function ObjecttiveQuestions() {
  const fullScreen = useFullScreen();
  const classes = useStyles({});
  return (
    <Container className={classes.root}>
      <Box pt={2} mb={4} pl={fullScreen ? 0 : 1} pr={fullScreen ? 0 : 1}>
        <Typography variant='h4' align='center'>
          Why 105 Objective Questions?
        </Typography>
        <Divider />
        <Box m={2} ml={fullScreen ? 0 : 2} mr={fullScreen ? 0 : 2}>
          <Typography variant='h5' align='center'>
            {`The questions that inform the database provide information about an app across six different categories aligned with the levels of the APA framework.`}
          </Typography>
        </Box>

        <Box pt={4}>
          <Grid container item xs={12} justify='center' spacing={2}>
            {buttons.map(b => (
              <Grid item key={b.title}>
                <Box pt={1} pb={1} mb={1}>
                  <Typography align='center'>
                    <img style={{ width: '60%' }} src={b.img} alt={b.title} />
                  </Typography>
                </Box>
                <DialogButton
                  Module={{ ...GenericObjectiveQuestionDialog, id: b.title, ...b }}
                  className={classes.button}
                  size='large'
                  variant='outlined'
                  tooltip='Click to View'
                  Icon={null}
                >
                  {b.title}
                </DialogButton>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
