import * as React from 'react';
import { Grid, Typography, Divider, Box, Collapse, IconButton, Button } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useFullScreen } from '../../hooks';
import DialogButton from '../application/GenericDialog/DialogButton';
import { useRouteState } from '../layout/store';
import { useHandleChangeRoute } from '../layout/hooks';
import { publicUrl } from '../../helpers';
import ExpandableDescription from '../application/GenericTable/ApplicationsGrid/ExpandableDescription';
import ImageCarousel from '../general/ImageCarousel';
import { useAppHistoryData } from '../application/GenericTable/ApplicationHistory/selectors';
import { Pagination, Alert, AlertTitle } from '@mui/material';
import ViewAppRating from './ViewAppRating';
import * as Icons from '@mui/icons-material';
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
  const [state] = useRouteState();
  const { app = {}, from } = state;

  return <ViewAppContent app={app} from={from} />;
}

export function ViewAppContent({ app = {}, from }) {
  const classes = useStyles();
  var sm = useFullScreen('sm');
  var isPwa = from === 'pwa';

  const { _id, appleStore, androidStore } = app as any;
  console.log('Viewing app', app);

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
    <Grid container justifyContent='flex-start' style={{ padding: sm ? 16 : 32 }} spacing={2}>
      {!isPwa && (
        <Grid component={Button} item style={{ cursor: 'pointer' }} onClick={handleChangeRoute(publicUrl(from === 'Admin' ? '/Admin' : '/Apps'), {})}>
          <Typography>{`<   Back To Results`}</Typography>
        </Grid>
      )}
      <Grid item xs={12}>
        <ViewAppHeader app={app} from={from} />
      </Grid>
      <Grid item xs={12}>
        <Divider />
        {from !== 'pwa' && (
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
                  <Grid container spacing={4} justifyContent='space-between'>
                    <Grid item>
                      <AlertTitle>
                        <strong>Are you currently using this App?</strong>
                      </AlertTitle>
                      If so, would you like to participate in a survey to help improve this web application?
                    </Grid>
                    <Grid item xs>
                      <DialogButton
                        onClick={handleChangeRoute(publicUrl('/Survey'), {
                          app,
                          mode: 'add',
                          surveyType: 'Initial',
                          surveyId: undefined,
                          followUpSurveyType: undefined
                        })}
                        variant='surveyButton'
                      >
                        Click Here to Take Survey
                      </DialogButton>
                    </Grid>
                  </Grid>
                </Alert>
              )}
            </Box>
          </Collapse>
        )}
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
            <Typography variant='body1'>{`Explore the app's qualitative ratings & reviews`}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Box mt={2}>{rating && <ViewAppRating {...rating.getValues()} />}</Box>
          </Grid>
          {history.length > 1 && (
            <Grid item xs={12}>
              <Grid container justifyContent='flex-end'>
                <Pagination page={page} count={history.length} variant='outlined' shape='rounded' onChange={handlePageChange} />
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}
