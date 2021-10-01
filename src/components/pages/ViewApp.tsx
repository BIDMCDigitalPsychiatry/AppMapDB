import * as React from 'react';
import { Grid, Typography, createStyles, makeStyles, Divider, Box, Collapse, IconButton } from '@material-ui/core';
import { useFullScreen } from '../../hooks';
import DialogButton from '../application/GenericDialog/DialogButton';
import { useRouteState } from '../layout/store';
import { useHandleChangeRoute } from '../layout/hooks';
import { publicUrl } from '../../helpers';
import ExpandableDescription from '../application/GenericTable/ApplicationsSummary/ExpandableDescription';
import ImageCarousel from '../general/ImageCarousel';
import { useAppHistoryData } from '../application/GenericTable/ApplicationHistory/selectors';
import { Pagination, Alert } from '@material-ui/lab';
import ViewAppRating from './ViewAppRating';
import * as Icons from '@material-ui/icons';
import ViewAppHeader from './ViewAppHeader';

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    primaryText: {
      fontSize: 18,
      fontWeight: 700,
      color: palette.primary.dark
    },
    bold: {
      fontWeight: 900,
      color: palette.common.black
    }
  })
);

export default function ViewApp() {
  const classes = useStyles();
  var sm = useFullScreen('sm');

  const [state] = useRouteState();
  const { app = {}, from } = state;
  const { _id, appleStore, androidStore } = app;

  const fromSurvey = from === 'Survey';

  const handleChangeRoute = useHandleChangeRoute();

  const appleScreenshots = appleStore?.screenshots ?? [];
  const androidScreenshots = androidStore?.screenshots ?? [];
  const images = [...appleScreenshots, ...androidScreenshots];

  const history = useAppHistoryData('N/A', _id);

  const [page, setPage] = React.useState(1);

  const handlePageChange = React.useCallback(
    (event, page) => {
      setPage(page);
    },
    [setPage]
  );

  const rating = history[page - 1];

  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    setTimeout(() => setOpen(true), 1000);
  }, [setOpen]);

  return (
    <Grid container justify='center' style={{ padding: sm ? 16 : 32 }} spacing={2}>
      <Grid item xs={12} style={{ cursor: 'pointer' }} onClick={handleChangeRoute(publicUrl('/Apps'), {})}>
        <Typography>{`<   Back To Results`}</Typography>
      </Grid>
      <Grid item xs={12}>
        <ViewAppHeader app={app} />
      </Grid>
      <Grid item xs={12}>
        <Divider />
        <Collapse in={open}>
          <Box mt={2}>
            {fromSurvey ? (
              <Alert
                severity='success'
                action={
                  <IconButton
                    aria-label='close'
                    color='inherit'
                    size='small'
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    <Icons.Close fontSize='inherit' />
                  </IconButton>
                }
              >
                Thank you for participating in our survey!
              </Alert>
            ) : (
              <Alert
                severity='info'
                action={
                  <IconButton
                    aria-label='close'
                    color='inherit'
                    size='small'
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    <Icons.Close fontSize='inherit' />
                  </IconButton>
                }
              >
                Are you currently using this App? If so, would you like to participate in a survey to help improve this web application?
                <DialogButton
                  onClick={handleChangeRoute(publicUrl('/Survey'), { app, mode: 'add' })}
                  variant='primaryButton2'
                  fullWidth={false}
                  style={{ marginLeft: 16, paddingLeft: 12, paddingRight: 12 }}
                >
                  Click Here to Take Survey
                </DialogButton>
              </Alert>
            )}
          </Box>
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography className={classes.bold}>Description from App Store, Not Vetted by MIND:</Typography>
          </Grid>
          <Grid item xs={12}>
            <ExpandableDescription maxDescription={2000} appleStore={appleStore} androidStore={androidStore} />
          </Grid>
          <Grid item xs={12}>
            <Box mt={4} mb={4}>
              <ImageCarousel images={images} />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography className={classes.primaryText} variant='body1'>
              Ratings and Reviews ({history.length})
            </Typography>
            <Typography variant='caption'>{`Explore the app's qualitative ratings & reviews`}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Box mt={2}>
              <ViewAppRating {...rating.getValues()} />
            </Box>
          </Grid>
          {history.length > 1 && (
            <Grid item xs={12}>
              <Grid container justify='flex-end'>
                <Pagination page={page} count={history.length} variant='outlined' shape='rounded' onChange={handlePageChange} />
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}
