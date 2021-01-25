import * as React from 'react';
import { Grid, Typography, createStyles, makeStyles, Divider, Box } from '@material-ui/core';
import { useFullScreen, useSignedIn } from '../../hooks';
import DialogButton, { EditDialogButton } from '../application/GenericDialog/DialogButton';
import { useRouteState } from '../layout/store';
import PlatformButtons from '../application/GenericTable/ApplicationsSummary/PlatformButtons';
import { useHandleChangeRoute } from '../layout/hooks';
import { getDayTimeFromTimestamp, publicUrl } from '../../helpers';
import { getAppName, getAppCompany, getAppIcon } from '../application/GenericTable/Applications/selectors';
import ExpandableDescription from '../application/GenericTable/ApplicationsSummary/ExpandableDescription';
import { AppState } from '../../store';
import { useSelector } from 'react-redux';
import { tables } from '../../database/dbConfig';
import * as SuggestEditDialog from '../application/GenericDialog/SuggestEdit';
import ImageCarousel from '../general/ImageCarousel';
import { useAppHistoryData } from '../application/GenericTable/ApplicationHistory/selectors';
import { Pagination } from '@material-ui/lab';
import ViewAppRating from './ViewAppRating';

const imageHeight = 144;

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    primaryText: {
      fontSize: 18,
      fontWeight: 700,
      color: palette.primary.dark
    },
    primaryLightText: {
      fontWeight: 700,
      color: palette.primary.light
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
  const {
    _id,
    privacies = [],
    clinicalFoundations = [],
    platforms,
    androidLink,
    iosLink,
    webLink,
    appleStore,
    androidStore,
    costs = [],
    updated,
    created
  } = state;
  const initialValues = useSelector((s: AppState) => s.database.applications[_id]);
  const name = getAppName(state);
  const company = getAppCompany(state);
  const icon = getAppIcon(state);

  const handleChangeRoute = useHandleChangeRoute();

  const signedIn = useSignedIn();

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

  return (
    <Grid container justify='center' style={{ padding: sm ? 16 : 32 }} spacing={2}>
      <Grid item xs={12} style={{ cursor: 'pointer' }} onClick={handleChangeRoute(publicUrl('/Apps'), {})}>
        <Typography>{`<   Back To Results`}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item style={{ width: imageHeight + 16 }}>
            <img style={{ height: imageHeight, borderRadius: 15 }} src={icon} alt='logo' />
          </Grid>
          <Grid item xs>
            <Grid container spacing={4}>
              <Grid item zeroMinWidth xs>
                <Grid container style={{ minWidth: 300 }}>
                  <Grid item xs={12}>
                    <Typography className={classes.primaryLightText} variant='h5'>
                      {name || 'Unknown Name'}
                    </Typography>
                    <Typography color='textSecondary'>{company}</Typography>
                  </Grid>
                  <Grid item xs={12} style={{ marginTop: 8, marginBottom: 8 }}>
                    <PlatformButtons platforms={platforms} androidLink={androidLink} iosLink={iosLink} webLink={webLink} />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={1}>
                      <Grid item>
                        <Typography color='textSecondary' variant='caption'>
                          Costs:
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography noWrap className={classes.primaryLightText} variant='caption'>
                          {costs.length === 0 ? (
                            'Unknown Cost'
                          ) : costs.length > 2 ? (
                            <DialogButton variant='link' size='small' Icon={null} tooltip={costs.join(' | ')}>
                              Multiple Associated Costs
                            </DialogButton>
                          ) : (
                            costs.join(' | ')
                          )}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={1}>
                      <Grid item>
                        <Typography color='textSecondary' variant='caption'>
                          App Has Privacy Policy:
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography className={classes.primaryLightText} variant='caption'>
                          {privacies.includes('Has Privacy Policy') ? 'Yes' : 'No'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item style={{ width: 256 }}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                {signedIn ? (
                  <EditDialogButton
                    variant='primaryButton2'
                    size='large'
                    id='Rate an App V2'
                    onClick={handleChangeRoute(publicUrl('/RateExistingApp'))}
                    initialValues={{ [tables.applications]: initialValues }}
                    tooltip='Rate App'
                    placement='bottom'
                  >
                    Submit New App Rating
                  </EditDialogButton>
                ) : (
                  <DialogButton variant='primaryButton2' size='large' onClick={handleChangeRoute(publicUrl('/RateAnApp'))}>
                    Rate an App
                  </DialogButton>
                )}
              </Grid>
              <Grid item xs={12} style={{ textAlign: 'right' }}>
                <DialogButton
                  Module={SuggestEditDialog}
                  initialValues={{ [tables.applications]: initialValues }}
                  variant='arrowButton'
                  label='Flag/Suggest an Edit'
                />
              </Grid>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={12}>
                    <Grid container spacing={1}>
                      <Grid item>
                        <Typography color='textSecondary' variant='caption'>
                          Last App Rating:
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography noWrap className={classes.primaryLightText} variant='caption'>
                          {updated ? getDayTimeFromTimestamp(updated) : created ? getDayTimeFromTimestamp(created) : ''}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Grid container spacing={1}>
                      <Grid item>
                        <Typography color='textSecondary' variant='caption'>
                          App Has Supported Studies:
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography className={classes.primaryLightText} variant='caption'>
                          {clinicalFoundations.includes('Supporting Studies') ? 'Yes' : 'No'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Divider />
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
              Ratings and Reviews
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
