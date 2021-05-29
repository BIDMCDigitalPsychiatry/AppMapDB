import * as React from 'react';
import { Typography, Box, Container, Grid, makeStyles, createStyles } from '@material-ui/core';
import DialogButton from '../application/GenericDialog/DialogButton';
import originFunctionality from '../../images/originfunctionality.png';
import engagementStyle from '../../images/engagementstyle.png';
import privacySecurity from '../../images/privacysecurity.png';
import inputsOutputs from '../../images/inputsoutputs.png';
import clinicalFoundation from '../../images/clinicalfoundation.png';
import interoperabilitySharing from '../../images/interoperabilitysharing.png';
import * as GenericObjectiveQuestionDialog from '../application/GenericDialog/ObjectiveQuestions/GenericObjectiveQuestionDialog';
import marked from 'marked';
import DOMPurify from 'dompurify';

const contentPath = require('../../content/ObjectiveQuestions.md').default;

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
  const classes = useStyles({});
  const [state, setState] = React.useState({ markdown: '' });

  React.useEffect(() => {
    fetch(contentPath)
      .then(response => {
        return response.text();
      })
      .then(text => {
        setState({
          markdown: DOMPurify.sanitize(marked(text))
        });
      });
  }, [setState]);

  return (
    <Container className={classes.root}>
      <article dangerouslySetInnerHTML={{ __html: state.markdown }}></article>

      <Box pt={2} pb={2}>
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
    </Container>
  );
}
