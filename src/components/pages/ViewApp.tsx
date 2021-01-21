import * as React from 'react';
import { Grid, Typography, createStyles, makeStyles, Divider } from '@material-ui/core';
import { useFullScreen } from '../../hooks';
import DialogButton from '../application/GenericDialog/DialogButton';
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

const imageHeight = 144;

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
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
  const { _id, privacies, platforms, androidLink, iosLink, webLink, appleStore, androidStore, costs = [], updated, created } = state;
  const initialValues = useSelector((s: AppState) => s.database.applications[_id]);
  const name = getAppName(state);
  const company = getAppCompany(state);
  const icon = getAppIcon(state);

  const handleChangeRoute = useHandleChangeRoute();

  return (
    <Grid container justify='center' style={{ padding: sm ? 16 : 32 }} spacing={2}>
      <Grid item xs={12} style={{ cursor: 'pointer' }} onClick={handleChangeRoute(publicUrl('/Apps'), {})}>
        <Typography>{`<   Back To Results`}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item style={{ width: imageHeight + 16 }}>
            <img style={{ height: imageHeight }} src={icon} alt='logo' />
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
          <Grid item style={{ width: 248 }}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <DialogButton variant='primaryButton2' size='large' onClick={handleChangeRoute(publicUrl('/RateNewApp'), state)}>
                  Submit New App Rating
                </DialogButton>
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
                          {privacies.includes('Has Privacy Policy') ? 'Yes' : 'No'}
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
            <Typography variant='caption' className={classes.bold}>
              Description from App Store, Not Vetted by MIND:
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <ExpandableDescription appleStore={appleStore} androidStore={androidStore} />
          </Grid>
          <Grid item xs={12}>
            More to be completed...
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
