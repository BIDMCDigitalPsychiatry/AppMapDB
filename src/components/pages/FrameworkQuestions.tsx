import * as React from 'react';
import { Box, Grid, makeStyles, createStyles, Container, Typography, Divider } from '@material-ui/core';
import DialogButton from '../application/GenericDialog/DialogButton';
import * as FrameworkDialog from '../application/GenericDialog/Framework';
import * as ObjectiveQuestionsDialog from '../application/GenericDialog/ObjectiveQuestions';
import { useFullScreen } from '../../hooks';
import marked from 'marked';
import DOMPurify from 'dompurify';
import ReactPlayer from 'react-player';
import { useWidth } from '../layout/store';

const contentPath = require('../../content/FrameworkQuestions.md');
const videoPath = require('../../content/zoom_1.mp4');

const useStyles = makeStyles(() =>
  createStyles({
    button: {
      marginTop: 32,
      minHeight: 80,
      minWidth: 300
    }
  })
);

export const ContentBox = ({ p = 2, children }) => {
  const fullScreen = useFullScreen();
  return (
    <Box pl={fullScreen ? 1 : p} pr={fullScreen ? 1 : p} pt={fullScreen ? 2 : 4}>
      {children}
    </Box>
  );
};

export default function FrameworkQuestions() {
  const classes = useStyles({});
  const [state, setState] = React.useState({ markdown: '' });
  const width = useWidth();

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
    <section>
      <Container>
        <article dangerouslySetInnerHTML={{ __html: state.markdown }}></article>
      </Container>
      <Container style={{ maxWidth: 800 }}>
        <Grid container alignItems='center' justify='center' spacing={2}>
          <Grid container item xs={6} style={{ minWidth: 300 }} justify='center'>
            <DialogButton
              Module={FrameworkDialog}
              className={classes.button}
              size='large'
              variant='outlined'
              placement='right'
              tooltip='Click to View'
              Icon={null}
            >
              APA App Evaluation Model
            </DialogButton>
          </Grid>
          <Grid container item xs={6} style={{ minWidth: 300 }} justify='center'>
            <DialogButton
              Module={ObjectiveQuestionsDialog}
              className={classes.button}
              size='large'
              variant='outlined'
              placement='right'
              tooltip='Click to View'
              Icon={null}
            >
              Why 105 Objective Questions?
            </DialogButton>
          </Grid>
        </Grid>
        <Divider style={{ marginTop: 16 }} />
        <Box pt={2}>
          <Grid container justify='center'>
            <Grid item xs={12}>
              <Typography>Actional App Evaluation Video:</Typography>
            </Grid>
            <Grid item style={{ paddingTop: 16, paddingBottom: 24 }} xs={12}>
              <Grid container justify='center'>
                <Grid item>
                  <ReactPlayer url={videoPath} controls={true} width={Math.min(width - 32, 640)} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </section>
  );
}
