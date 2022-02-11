import React from 'react';
import { Container, Grid, Typography, Paper } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import GenericDialog from '../GenericDialog';
import { DialogContent } from '@mui/material';
import { ApplicationTabsView } from '../RateNewApp/templates/ApplicationTabsView';
import { useDialogState } from '../useDialogState';
import { ApplicationReviews } from '../../GenericTable/ApplicationReviews/table';
import { tables } from '../../../../database/dbConfig';

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

export default function ApplicationDialog({ id = title }) {
  const classes = useStyles({});
  const [{ initialValues = {} }] = useDialogState(id);
  const applications = initialValues[tables.applications] ?? {};
  const { groupId } = applications;

  return (
    <GenericDialog id={id} title={id} submitLabel={null} cancelLabel='Close' maxWidth='lg'>
      <DialogContent dividers>
        <Container className={classes.root}>
          <Grid container justifyContent='center' spacing={3}>
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
        </Container>
      </DialogContent>
    </GenericDialog>
  );
}
