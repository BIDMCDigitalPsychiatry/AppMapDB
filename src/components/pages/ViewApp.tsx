import * as React from 'react';
import { Grid, Typography, Divider, Box, Collapse, IconButton, Button } from '@mui/material';
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
            Back to results
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
                        No thanks
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
                        Take the Survey
                      </DialogButton>
                    </Box>
                  }
                >
                  <AlertTitle>
                    <strong>Are you currently using this App?</strong>
                  </AlertTitle>
                  If so, would you like to participate in a survey to help improve this web application?
                </Alert>
              )}
            </Box>
          </Collapse>
        )}
      </Grid>
      {/* Store-sourced content: visually distinct (tinted, bordered) from MIND's own data below. */}
      <Grid item xs={12}>
        <Box sx={{ backgroundColor: '#F7F9FC', border: '1px solid #E5EAF0', borderRadius: 3, p: { xs: 2, sm: 3 } }}>
          <Typography variant='h5'>About this app</Typography>
          <Typography variant='caption' color='textSecondary' display='block' sx={{ mb: 1.5 }}>
            Description and screenshots from the app store — not vetted by MIND
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
          <Typography variant='h5'>Ratings &amp; Reviews ({history.length})</Typography>
          <Typography variant='caption' color='textSecondary' display='block' sx={{ mb: 1.5 }}>{`Qualitative ratings & reviews from MIND evaluators`}</Typography>
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
