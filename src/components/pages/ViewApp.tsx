import * as React from 'react';
import { Grid, Typography, createStyles, makeStyles } from '@material-ui/core';
import { useFullScreen } from '../../hooks';
import DialogButton from '../application/GenericDialog/DialogButton';
import { useRouteState } from '../layout/store';
import PlatformButtons from '../application/GenericTable/ApplicationsSummary/PlatformButtons';
import { useHandleChangeRoute } from '../layout/hooks';
import { getDayTimeFromTimestamp, publicUrl } from '../../helpers';
import { getAppName, getAppCompany, getAppIcon } from '../application/GenericTable/Applications/selectors';
import ExpandableDescription from '../application/GenericTable/ApplicationsSummary/ExpandableDescription';

const imageHeight = 128;

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    primaryLightText: {
      fontWeight: 700,
      color: palette.primary.light
    }
  })
);

export default function ViewApp() {
  const classes = useStyles();
  var sm = useFullScreen('sm');

  const [state] = useRouteState();
  const { platforms, androidLink, iosLink, webLink, appleStore, androidStore, costs = [], updated, created } = state;
  const name = getAppName(state);
  const company = getAppCompany(state);
  const icon = getAppIcon(state);

  const handleChangeRoute = useHandleChangeRoute();

  return (
    <Grid container justify='center' style={{ padding: sm ? 16 : 32 }} spacing={sm ? 2 : 4}>
      <Grid item xs={12} style={{ cursor: 'pointer' }} onClick={handleChangeRoute(publicUrl('/Apps'), {})}>
        <Typography>{`<   Back To Results`}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs style={{ minWidth: 300 }}>
            <Grid container spacing={1}>
              <Grid item style={{ maxWidth: imageHeight + 16 }}>
                <img style={{ height: imageHeight }} src={icon} alt='logo' />
              </Grid>
              <Grid item zeroMinWidth xs>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Typography className={classes.primaryLightText} variant='h5'>
                      {name || 'Unknown Name'}
                    </Typography>
                    <Typography color='textSecondary'>{company}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <PlatformButtons platforms={platforms} androidLink={androidLink} iosLink={iosLink} webLink={webLink} />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography noWrap color='textSecondary' variant='caption'>
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
                <ExpandableDescription appleStore={appleStore} androidStore={androidStore} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item style={{ width: 240 }}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <DialogButton variant='primaryButton2' size='large' onClick={handleChangeRoute(publicUrl('/RateNewApp'), state)}>
                  Submit New App Rating
                </DialogButton>
              </Grid>
              <Grid item xs={12} style={{ textAlign: 'right' }}>
                <DialogButton variant='arrowButton' label='Flag/Suggest an Edit' />
              </Grid>
              <Grid item xs={12}>
                <Typography noWrap color='textSecondary' variant='caption'>
                  Last App Rating: {updated ? getDayTimeFromTimestamp(updated) : created ? getDayTimeFromTimestamp(created) : ''}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        More to be completed...
      </Grid>
    </Grid>
  );
}
