import { Button, Divider, Grid, Typography } from '@mui/material';
import * as Icons from '@mui/icons-material';
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
      // Metadata values: readable brand color (the old primary.light was
      // low-contrast on white)
      fontWeight: 700,
      color: palette.primary.dark
    }
  })
);

const imageHeight = 144;

// Route state is persisted across sessions/deploys, so `app` can arrive in a
// stale or malformed shape (e.g. tag fields as strings). Never crash on it.
const asArray = v => (Array.isArray(v) ? v : []);

export default function ViewAppHeader({ app = {} as any, type = 'view', from = undefined }) {
  const classes = useStyles();
  const {
    _id,
    privacies: privaciesRaw = [],
    platforms: platformsRaw = [],
    androidLink,
    iosLink,
    webLink,
    costs: costsRaw = [],
    updated,
    created,
    feasibilityStudiesLink = undefined,
    efficacyStudiesLink = undefined,
    clinicalFoundations: clinicalFoundationsRaw = []
  } = app;
  const privacies = asArray(privaciesRaw);
  const platforms = asArray(platformsRaw);
  const costs = asArray(costsRaw);
  const clinicalFoundations = asArray(clinicalFoundationsRaw);

  const initialValues = useSelector((s: AppState) => s.database?.applications?.[_id] || {});
  const name = getAppName(app);
  const company = getAppCompany(app);
  const icon = getAppIcon(app);
  const signedInRater = useSignedInRater();

  const handleChangeRoute = useHandleChangeRoute();
  const hasSupportingStudies = clinicalFoundations.includes('Supporting Studies');
  const [routeState] = useRouteState(); // Keep route state for back functionality
  const webPlatform = platforms?.filter(p => p?.toLowerCase() === 'web').map(p => 'Visit Website');

  const lastRating = useLastRatingDateTime({ created, updated });

  return (
    <Grid container spacing={4}>
      <Grid item style={{ width: imageHeight + 16 }}>
        <img style={{ height: imageHeight, width: imageHeight, objectFit: 'cover', borderRadius: 28, border: '1px solid #E5EAF0' }} src={icon} alt='logo' />
      </Grid>
      <Grid item xs>
        <Grid container spacing={4}>
          <Grid item zeroMinWidth xs>
            <Grid container style={{ minWidth: 300 }}>
              <Grid item xs={12}>
                <Typography variant='h3' style={{ letterSpacing: '-0.02em' }}>
                  {name || 'Unknown Name'}
                </Typography>
                <Typography color='textSecondary' style={{ marginTop: 2 }}>
                  {company}
                </Typography>
              </Grid>
              <Grid item xs={12} style={{ marginTop: 8, marginBottom: 8 }}>
                {/* One row for every way to get the app: Visit Website leads,
                    visually distinct from the store platform buttons. */}
                <Grid container spacing={1} alignItems='center'>
                  {webPlatform?.length > 0 && (
                    <Grid item>
                      <Button
                        variant='contained'
                        size='small'
                        startIcon={<Icons.Language />}
                        onClick={e => {
                          e.stopPropagation();
                          const win = window.open(webLink, '_blank');
                          win && win.focus();
                        }}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Visit Website
                      </Button>
                    </Grid>
                  )}
                  <Grid item>
                    <PlatformButtons
                      platforms={platforms?.filter(p => p?.toLowerCase() !== 'web') || []}
                      androidLink={androidLink}
                      iosLink={iosLink}
                      webLink={webLink}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={1}>
                  <Grid item>
                    <Typography color='textSecondary' variant='caption'>
                      Costs:
                    </Typography>
                  </Grid>
                  <Grid item xs>
                    <Typography className={classes.primaryLightText} variant='caption'>
                      {costs.length === 0 ? 'Unknown Cost' : costs.join(' | ')}
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
              <Grid item xs={12}>
                <Grid container spacing={1}>
                  <Grid item>
                    <Typography color='textSecondary' variant='caption'>
                      App Has Supporting Studies:
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography className={classes.primaryLightText} variant='caption'>
                      {hasSupportingStudies ? 'Yes' : 'No'}
                    </Typography>
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
      </Grid>
      <Grid item style={{ width: 296 }}>
        <Grid container spacing={1} style={{ background: '#F7F9FC', border: '1px solid #E5EAF0', borderRadius: 12, padding: 16, margin: 0, width: '100%' }}>
          {from !== 'pwa' && type !== 'survey' && (
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
                        parent: initialValues?._id,
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
              <Grid item xs={12}>
                <DialogButton
                  Module={SuggestEditDialog}
                  initialValues={{ [tables.applications]: initialValues }}
                  variant='arrowButton'
                  label='Flag/Suggest an Edit'
                />
              </Grid>
              <Grid item xs={12}>
                <Divider style={{ margin: '8px 0' }} />
              </Grid>
            </>
          )}
          <Grid item xs={12}>
            <Grid container spacing={1} justifyContent='space-between'>
              <Grid item>
                <Typography color='textSecondary' variant='body2'>
                  Last updated
                </Typography>
              </Grid>
              <Grid item>
                <Typography noWrap className={classes.primaryLightText} variant='body2'>
                  {lastRating}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
