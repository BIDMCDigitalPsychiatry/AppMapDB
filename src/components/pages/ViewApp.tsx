import * as React from 'react';
import { Grid, Typography, Divider, Box, Collapse, IconButton, Button, CircularProgress } from '@mui/material';
import { useHistory, useLocation } from 'react-router';
import { createStyles } from '../../styles/jss';
import { makeStyles } from '../../styles/jss';
import { useFullScreen } from '../../hooks';
import DialogButton from '../application/GenericDialog/DialogButton';
import { useRouteState } from '../layout/store';
import { useHandleChangeRoute } from '../layout/hooks';
import { publicUrl } from '../../helpers';
import ImageCarousel from '../general/ImageCarousel';
import { useAppHistoryData } from '../application/GenericTable/ApplicationHistory/selectors';
import { Pagination, Alert, AlertTitle } from '@mui/material';
import ViewAppRating from './ViewAppRating';
import * as Icons from '@mui/icons-material';
import ViewAppHeader from './ViewAppHeader';
import ExpandableDescriptionWithLanguages from '../application/GenericTable/ApplicationsGrid/ExpandableDescriptionWithLanguages';
import { useLanguage, useT } from '../../i18n';
import { appDisplayName, appPath, matchesShortId, parseAppPath } from '../../appUrl';
import { useApprovedAppByShortId } from './useAppTableData';

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

const DEFAULT_TITLE = 'MIND: Find and Compare Mental Health Apps'; // matches index.html

/**
 * Public app page at /apps/<name>-<id> (and /fr/…, /de/…), see src/appUrl.ts. Arriving from a card, the
 * record comes with the navigation and shows immediately; opening the address directly (a shared link, a
 * search result) looks it up. A /fr or /de address sets the language on arrival; afterwards the address is
 * kept in step with the interface language and the app's current name.
 */
export function AppPage() {
  const t = useT();
  const { pathname } = useLocation();
  const history = useHistory();
  const [state] = useRouteState();
  const [lang, setLang] = useLanguage();
  const parsed = parseAppPath(pathname);
  const shortId = parsed?.shortId ?? '';

  const fromNavigation = state?.app && matchesShortId(state.app, shortId) ? state.app : undefined;
  const lookup = useApprovedAppByShortId(fromNavigation ? '' : shortId);
  const app = fromNavigation ?? lookup.app;
  const status = fromNavigation ? 'found' : lookup.status;

  // On arrival, a /fr or /de address sets the interface language, like ?lang= does. A plain address keeps
  // the visitor's own choice (a French visitor opening a shared English link stays in French).
  const urlLanguage = parsed && parsed.lang !== 'en' ? parsed.lang : null;
  const arrivalLanguageApplied = React.useRef(!urlLanguage);
  React.useEffect(() => {
    if (urlLanguage && urlLanguage !== lang) setLang(urlLanguage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Afterwards, keep the address matching the interface language and the app's current name. Until the
  // arrival language has taken effect, `lang` is still the previous one and must not rewrite the address.
  React.useEffect(() => {
    if (!app || !parsed) return;
    if (!arrivalLanguageApplied.current) {
      if (lang !== urlLanguage) return;
      arrivalLanguageApplied.current = true;
    }
    const canonical = appPath(app, lang);
    if (canonical !== pathname) history.replace(canonical, history.location.state);
  }, [app, lang, pathname, parsed, history]);

  const name = app ? appDisplayName(app) : '';
  React.useEffect(() => {
    if (!name) return;
    document.title = `${name} | MIND`;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [name]);

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'missing' || !app) {
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto', p: 4 }}>
        <Alert severity='info'>
          <AlertTitle>{t('This app is no longer listed')}</AlertTitle>
          {t('It may have been removed or merged with another listing.')}
        </Alert>
        <Button startIcon={<Icons.ArrowBack />} onClick={() => history.push(publicUrl('/Apps'))} sx={{ mt: 2, textTransform: 'none', fontWeight: 600 }}>
          {t('Browse all apps')}
        </Button>
      </Box>
    );
  }

  return <ViewAppContent app={app} from={fromNavigation ? state.from : undefined} />;
}

export function ViewAppContent({ app = {}, from }) {
  const classes = useStyles();
  const t = useT();
  var sm = useFullScreen('sm');
  var isPwa = from === 'pwa';

  const { _id, androidLink, iosLink, appleStore, androidStore, functionalities = [] } = app as any;

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
    // Centering/max-width lives on this wrapper, not the Grid container —
    // any margin on the same element as Grid's `spacing` prop cancels the
    // negative-margin compensation spacing relies on, leaking padding out
    // past the viewport's right edge (the same bug hit on the Framework
    // page and the footer).
    <Box style={{ maxWidth: 1160, margin: '0 auto', padding: sm ? 16 : 32, boxSizing: 'border-box', overflowX: 'hidden' }}>
      <Grid container justifyContent='flex-start' spacing={2}>
        {!isPwa && (
        <Grid item xs={12}>
          <Button
            startIcon={<Icons.ArrowBack />}
            onClick={handleChangeRoute(publicUrl(from === 'Admin' ? '/Admin' : '/Apps'), {})}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {t('Back to results')}
          </Button>
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
                      aria-label={t('close')}
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
                  {t('Thank you for participating in our survey!')}
                </Alert>
              ) : (
                <Alert
                  severity='success'
                  sx={{
                    // Keep the icon paired with the message on one line (row);
                    // only the action row wraps onto its own full-width line
                    // on mobile via flexBasis. Putting the whole Alert into a
                    // column (an earlier attempt) stranded the icon on its
                    // own line above the text, which read as broken.
                    flexWrap: 'wrap',
                    '& .MuiAlert-message': { flex: 1, minWidth: 220 },
                    '& .MuiAlert-action': {
                      alignItems: 'center',
                      pt: 0,
                      pr: 1,
                      flexBasis: sm ? '100%' : undefined,
                      justifyContent: sm ? 'flex-end' : undefined,
                      ml: sm ? 0 : undefined,
                      mt: sm ? 1 : undefined
                    }
                  }}
                  action={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end', width: '100%' }}>
                      <Button color='inherit' size='small' onClick={() => setOpen(false)} sx={{ textTransform: 'none', fontWeight: 600, opacity: 0.75 }}>
                        {t('No thanks')}
                      </Button>
                      <DialogButton
                        fullWidth={false}
                        // The surveyButton CSS class hardcodes width:300 (and
                        // the fullWidth prop's own width:100% competes with it
                        // at equal CSS specificity — which one wins depends on
                        // stylesheet injection order, not this prop). Force it
                        // with an inline style, which always wins regardless.
                        style={{ width: 'auto', minWidth: 0 }}
                        onClick={handleChangeRoute(publicUrl('/Survey'), {
                          app,
                          mode: 'add',
                          surveyType: 'Initial',
                          surveyId: undefined,
                          followUpSurveyType: undefined
                        })}
                        variant='surveyButton'
                      >
                        {t('Take the Survey')}
                      </DialogButton>
                    </Box>
                  }
                >
                  <AlertTitle>
                    <strong>{t('Are you currently using this App?')}</strong>
                  </AlertTitle>
                  {t('If so, would you like to participate in a survey to help improve this web application?')}
                </Alert>
              )}
            </Box>
          </Collapse>
        )}
      </Grid>
      {/* Store-sourced content: visually distinct (tinted, bordered) from MIND's own data below. */}
      <Grid item xs={12}>
        <Box sx={{ backgroundColor: '#F7F9FC', border: '1px solid #E5EAF0', borderRadius: 3, p: { xs: 2, sm: 3 } }}>
          <Typography variant='h5'>{t('About this app')}</Typography>
          <Typography variant='caption' color='textSecondary' display='block' sx={{ mb: 1.5 }}>
            {t('Description and screenshots from the app store — not vetted by MIND')}
          </Typography>
          <ExpandableDescriptionWithLanguages
            iosLink={iosLink}
            androidLink={androidLink}
            functionalities={functionalities}
            maxDescription={2000}
            appleStore={appleStore}
            androidStore={androidStore}
          />
          {images.length > 0 && (
            <Box mt={3}>
              <ImageCarousel images={images} />
            </Box>
          )}
        </Box>
      </Grid>

      {/* MIND's own evaluation lives on the open page; the tinted box above is
          what marks the store content as external. */}
      <Grid item xs={12}>
        <Box mt={1}>
          <Typography variant='h5'>{t('Ratings & Reviews ({{count}})', { count: history.length })}</Typography>
          <Typography variant='caption' color='textSecondary' display='block' sx={{ mb: 1.5 }}>{t('Qualitative ratings & reviews from MIND evaluators')}</Typography>
          {rating && <ViewAppRating {...rating.getValues()} />}
          {history.length > 1 && (
            <Box mt={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination page={page} count={history.length} variant='outlined' shape='rounded' onChange={handlePageChange} />
            </Box>
          )}
        </Box>
      </Grid>
      </Grid>
    </Box>
  );
}
