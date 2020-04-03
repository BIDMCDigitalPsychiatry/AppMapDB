import * as React from 'react';
import { Typography, Box, Grid, makeStyles, createStyles, Divider } from '@material-ui/core';
import DialogButton from '../application/GenericDialog/DialogButton';
import * as FrameworkDialog from '../application/GenericDialog/Framework';
import * as ObjectiveQuestionsDialog from '../application/GenericDialog/ObjectiveQuestions';

const useStyles = makeStyles(() =>
  createStyles({
    button: {
      marginTop: 32,
      minHeight: 80,
      minWidth: 300
    }
  })
);

export default function FrameworkQuestions() {
  const classes = useStyles({});

  return (
    <Box pt={2}>
      <Typography variant='h4' align='center'>
        {`How do you choose the right app?`}
      </Typography>
      <Divider />
      <Box mt={3}>
        <Typography variant='h6' align='center'>
          {`Each app's entry in the database is informed by 105 objective questions, giving you the necessary information to make your decision based on the app characteristics that matter most to you.  The questions are based on the APA App Evaluation Framework. `}
        </Typography>
      </Box>
      <Grid container alignItems='center' justify='center' spacing={0}>
        <Grid container item xs={12} justify='center'>
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
        <Grid container item xs={12} justify='center'>
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
    </Box>
  );
}
