import React from 'react';
import { Box, Container, Grid, makeStyles, createStyles, Divider, Typography, Paper } from '@material-ui/core';
import * as GenericObjectiveQuestionDialog from '../ObjectiveQuestions/GenericObjectiveQuestionDialog';
import GenericDialog from '../GenericDialog';
import { DialogContent } from '@material-ui/core';
import DialogButton from '../DialogButton';
import { ApplicationTabsView } from '../RateNewApp/templates/ApplicationTabsView';
import { useDialogState } from '../useDialogState';
import { ApplicationReviews } from '../../GenericTable/ApplicationReviews/table';

export const title = 'Application Information';

const useStyles = makeStyles(({ palette, spacing }) =>
  createStyles({
    root: {},
    header: { maxWidth: 800 },
    button: {
      height: 60,
      width: 175
    },
    paper: {
      background: palette.primary.main,
      color: palette.common.white,
      padding: spacing(1)
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
  const [{ initialValues = {} }] = useDialogState(id);
  const { applications = {} } = initialValues;
  const { groupId } = applications;

  return (
    <GenericDialog id={id} title={id} submitLabel={null} cancelLabel='Close' maxWidth='lg'>
      <DialogContent dividers>
        <Container className={classes.root}>
          <Grid container justify='center' spacing={3}>
            <Grid item xs style={{ minWidth: 280, maxWidth: 700 }}>
              <ApplicationTabsView {...applications} />
            </Grid>
            <Grid item xs style={{ minWidth: 280, maxWidth: 600 }}>
              <Paper className={classes.paper}>
                <Typography variant='h6'>Qualitative Reviews</Typography>
              </Paper>
              <ApplicationReviews groupId={groupId} height={500} />
            </Grid>
          </Grid>
          <Box pt={2} pb={2}>
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
          </Box>
        </Container>
      </DialogContent>
    </GenericDialog>
  );
}
