import { Grid, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import DialogButton, { EditDialogButton } from '../application/GenericDialog/DialogButton';
import PlatformButtons from '../application/GenericTable/ApplicationsGrid/PlatformButtons';
import { isEmpty, publicUrl, uuid } from '../../helpers';
import { getAppName, getAppCompany, getAppIcon } from '../application/GenericTable/Applications/selectors';
import { tables } from '../../database/dbConfig';
import * as SuggestEditDialog from '../application/GenericDialog/SuggestEdit';
import ArrowButtonCaption from '../general/ArrowButtonCaption';
import { useSignedInRater } from '../../hooks';
import { useHandleChangeRoute } from '../layout/hooks';
import { useSelector } from 'react-redux';
import { AppState } from '../../store';
import { useRouteState } from '../layout/store';
import { useLastRatingDateTime } from '../application/GenericTable/ApplicationsGrid/useLastRatingDateTime';

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    primaryLightText: {
      fontWeight: 700,
      color: palette.primary.light
    }
  })
);

const imageHeight = 144;

export default function ViewAppHeader({ app = {} as any, type = 'view' }) {
  const classes = useStyles();
  const {
    _id,
    privacies = [],
    platforms,
    androidLink,
    iosLink,
    webLink,
    costs = [],
    updated,
    created,
    feasibilityStudiesLink = undefined,
    efficacyStudiesLink = undefined,
    clinicalFoundations = []
  } = app;

  const initialValues = useSelector((s: AppState) => s.database.applications[_id]);
  const name = getAppName(app);
  const company = getAppCompany(app);
  const icon = getAppIcon(app);
  const signedInRater = useSignedInRater();

  const handleChangeRoute = useHandleChangeRoute();
  const hasSupportingStudies = clinicalFoundations.includes('Supporting Studies');
  const [routeState] = useRouteState(); // Keep route state for back functionality
  const webPlatform = platforms.filter(p => p?.toLowerCase() === 'web').map(p => 'Visit Website');

  const lastRating = useLastRatingDateTime({ created, updated });

  return (
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
                <PlatformButtons platforms={platforms.filter(p => p?.toLowerCase() !== 'web')} androidLink={androidLink} iosLink={iosLink} webLink={webLink} />
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
              {webPlatform.length > 0 && (
                <Grid item xs={12} style={{ marginTop: 8, marginBottom: 8 }}>
                  <PlatformButtons platforms={webPlatform} androidLink={androidLink} iosLink={iosLink} webLink={webLink} />
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item style={{ width: 256 }}>
        <Grid container spacing={1}>
          {type !== 'survey' && (
            <>
              <Grid item xs={12}>
                {signedInRater ? (
                  <EditDialogButton
                    variant='primaryButton2'
                    size='large'
                    id='Rate an App V2'
                    onClick={handleChangeRoute(publicUrl('/RateExistingApp'), routeState)}
                    initialValues={{
                      [tables.applications]: {
                        ...initialValues,
                        _id: uuid(),
                        parent: initialValues._id,
                        approved: false,
                        approverEmail: undefined,
                        created: new Date().getTime()
                      }
                    }}
                    tooltip='Rate App'
                    placement='bottom'
                  >
                    Submit New App Rating
                  </EditDialogButton>
                ) : (
                  <DialogButton variant='primaryButton2' size='large' onClick={handleChangeRoute(publicUrl('/RateAnApp'), routeState)}>
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
            </>
          )}
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12}>
                <Grid container spacing={1}>
                  <Grid item>
                    <Typography color='textSecondary' variant='caption'>
                      Last Rating:
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography noWrap className={classes.primaryLightText} variant='caption'>
                      {lastRating}
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
                      {hasSupportingStudies ? 'Yes' : 'No'}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              {hasSupportingStudies && !isEmpty(feasibilityStudiesLink) && (
                <Grid item>
                  <ArrowButtonCaption label='See Feasability Studies' link={feasibilityStudiesLink} />
                </Grid>
              )}
              {hasSupportingStudies && !isEmpty(efficacyStudiesLink) && (
                <Grid item>
                  <ArrowButtonCaption label='See Efficacy Studies' link={efficacyStudiesLink} />
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
