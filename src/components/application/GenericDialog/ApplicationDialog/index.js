import React from 'react';
import { Box, Container, Grid, makeStyles, createStyles, Divider } from '@material-ui/core';
import * as GenericObjectiveQuestionDialog from '../ObjectiveQuestions/GenericObjectiveQuestionDialog';
import GenericDialog from '../GenericDialog';
import { DialogContent } from '@material-ui/core';
import DialogButton from '../DialogButton';
import { ApplicationTabsView } from '../RateNewApp/templates/ApplicationTabsView';
import { useDialogState } from '../useDialogState';

export const title = 'Application Information';

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
    title: 'Screenshots'
  }
];

export default function ApplicationDialog({ id = title }) {
  const classes = useStyles({});
  const [{ initialValues }] = useDialogState(id);
  const { applications } = initialValues;
  return (
    <GenericDialog id={id} title={id} submitLabel={null} cancelLabel='Close' maxWidth='lg'>
      <DialogContent dividers>
        <Container className={classes.root}>
          <Grid container justify='center' spacing={3}>
            <Grid item xs style={{ maxWidth: 700 }}>
              <ApplicationTabsView {...applications} />
            </Grid>
            <Grid item xs style={{ minWidth: 280, maxWidth: 600 }}>
              <Grid container spacing={1}>
                Placholder for qualatative reviews
              </Grid>
            </Grid>
          </Grid>
          <Divider />
          <Box pt={2} pb={2}>
            <Grid container item xs={12} justify='center' spacing={2}>
              {buttons.map(b => (
                <Grid item key={b.title}>
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
      </DialogContent>
    </GenericDialog>
  );
}
