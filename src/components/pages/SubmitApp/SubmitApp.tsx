/*
 * Public "Submit an App" form (replaces the Google Form behind "Suggest an
 * App"). One section per step, with a section list on wide screens and a
 * progress bar on phones. Answers are saved in this browser as the person
 * goes; submissions go to the write API and land in Admin > App Submissions.
 */
import * as React from 'react';
import { Alert, Box, Button, CircularProgress, LinearProgress, List, ListItemButton, ListItemIcon, ListItemText, Paper, Typography } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { SubmissionForm, submitApp } from '../../../database/appSubmissions';
import { publicUrl } from '../../../helpers';
import { useHandleChangeRoute } from '../../layout/hooks';
import { SECTIONS } from './content';
import { clearDraft, emptyForm, Errors, firstInvalidStep, loadDraft, prepareForSubmit, saveDraft, STEP_IDS, validateStep } from './form';
import { STEP_COMPONENTS } from './steps';

const setIn = (obj: any, path: string[], value: any): any => {
  const [head, ...rest] = path;
  const next = Array.isArray(obj) ? [...obj] : { ...(obj ?? {}) };
  next[head] = rest.length ? setIn(next[head], rest, value) : value;
  return next;
};

const scrollToField = (key: string) => {
  const el = document.querySelector(`[data-field="${CSS.escape(key)}"]`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

export default function SubmitApp() {
  const draft = React.useMemo(() => loadDraft(), []);
  const [form, setForm] = React.useState<SubmissionForm>(draft?.form ?? emptyForm());
  const [step, setStep] = React.useState(Math.min(draft?.step ?? 0, STEP_IDS.length - 1));
  const [maxVisited, setMaxVisited] = React.useState(draft?.step ?? 0);
  const [errors, setErrors] = React.useState<Errors>({});
  const [resumed, setResumed] = React.useState(!!draft);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  const [done, setDone] = React.useState(false);
  const topRef = React.useRef<HTMLDivElement>(null);
  const changeRoute = useHandleChangeRoute();

  const stepId = STEP_IDS[step];
  const StepComponent = STEP_COMPONENTS[stepId];

  React.useEffect(() => {
    if (!done) saveDraft(form, step);
  }, [form, step, done]);

  const set = React.useCallback((path: string, value: any) => {
    setForm(prev => setIn(prev, path.split('.'), value));
    setErrors(prev => {
      const keys = Object.keys(prev).filter(k => k === path || k.startsWith(`${path}.`) || (path.startsWith('app.') && k === 'app.links'));
      if (!keys.length) return prev;
      const next = { ...prev };
      keys.forEach(k => delete next[k]);
      return next;
    });
  }, []);

  const goTo = React.useCallback((next: number) => {
    setErrors({});
    setStep(next);
    setMaxVisited(m => Math.max(m, next));
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }, []);

  const handleNext = (target = step + 1) => {
    const stepErrors = validateStep(stepId, form);
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      setTimeout(() => scrollToField(Object.keys(stepErrors)[0]), 0);
      return;
    }
    goTo(target);
  };

  const handleSubmit = async () => {
    const invalid = firstInvalidStep(form);
    if (invalid >= 0 && STEP_IDS[invalid] !== 'review') {
      goTo(invalid);
      setTimeout(() => {
        const stepErrors = validateStep(STEP_IDS[invalid], form);
        setErrors(stepErrors);
        setTimeout(() => scrollToField(Object.keys(stepErrors)[0]), 0);
      }, 0);
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await submitApp(prepareForSubmit(form));
      clearDraft();
      setDone(true);
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartOver = () => {
    clearDraft();
    setForm(emptyForm());
    setMaxVisited(0);
    setResumed(false);
    setDone(false);
    goTo(0);
  };

  const errorCount = Object.keys(errors).length;
  const isReview = stepId === 'review';

  if (done)
    return (
      <Box ref={topRef} sx={{ px: 2, py: { xs: 4, md: 8 }, display: 'flex', justifyContent: 'center' }}>
        <Paper variant='outlined' sx={{ maxWidth: 640, p: { xs: 3, md: 5 }, textAlign: 'center', borderRadius: 3 }}>
          <Icons.CheckCircleOutline color='success' sx={{ fontSize: 64 }} />
          <Typography variant='h4' sx={{ fontWeight: 800, mt: 1, color: 'primary.dark' }}>
            Thank you!
          </Typography>
          <Typography sx={{ mt: 2 }}>
            We’ve received your suggestion for <b>{form.app.name}</b>. Our team will review it, and we’ll contact you at <b>{form.submitter.email}</b> if we have
            any questions.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant='contained' sx={{ textTransform: 'none' }} onClick={changeRoute(publicUrl('/Apps'))}>
              Back to the app library
            </Button>
            <Button variant='outlined' sx={{ textTransform: 'none' }} onClick={handleStartOver}>
              Suggest another app
            </Button>
          </Box>
        </Paper>
      </Box>
    );

  return (
    <Box ref={topRef} sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto', scrollMarginTop: 80 }}>
      <Typography variant='h4' component='h1' sx={{ fontWeight: 800, color: 'primary.dark', fontSize: { xs: 26, md: 32 } }}>
        Suggest an App
      </Typography>
      <Typography color='text.secondary' sx={{ mt: 0.5, mb: 2 }}>
        Suggest a mental health app for MINDapps. Every suggestion is reviewed by our team before an app is listed.
      </Typography>

      {resumed && (
        <Alert
          severity='success'
          onClose={() => setResumed(false)}
          sx={{ mb: 2 }}
          action={
            <Button color='inherit' size='small' sx={{ textTransform: 'none', whiteSpace: 'nowrap' }} onClick={handleStartOver}>
              Start over
            </Button>
          }
        >
          Welcome back — we restored the answers you saved in this browser.
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* Section list (wide screens) */}
        <Paper variant='outlined' sx={{ display: { xs: 'none', md: 'block' }, width: 260, flexShrink: 0, position: 'sticky', top: 16, borderRadius: 2 }}>
          <List dense disablePadding sx={{ py: 1 }}>
            {STEP_IDS.map((id, i) => {
              const visited = i <= maxVisited;
              const complete = i < maxVisited && Object.keys(validateStep(id, form)).length === 0;
              return (
                <ListItemButton key={id} selected={i === step} disabled={!visited} onClick={() => goTo(i)} sx={{ py: 0.75 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {complete ? (
                      <Icons.CheckCircle fontSize='small' color='success' />
                    ) : (
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          fontSize: 12,
                          fontWeight: 700,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: i === step ? 'primary.main' : 'action.selected',
                          color: i === step ? '#fff' : 'text.secondary'
                        }}
                      >
                        {i + 1}
                      </Box>
                    )}
                  </ListItemIcon>
                  <ListItemText primary={SECTIONS[id].title} primaryTypographyProps={{ fontWeight: i === step ? 700 : 500 }} />
                </ListItemButton>
              );
            })}
          </List>
        </Paper>

        {/* Current section */}
        <Paper elevation={0} sx={{ flex: 1, minWidth: 0, borderRadius: { xs: 0, sm: 2 }, overflow: 'hidden', border: { xs: 'none', sm: '1px solid' }, borderColor: { sm: 'divider' }, mx: { xs: -2, sm: 0 } }}>
          <LinearProgress variant='determinate' value={((step + 1) / STEP_IDS.length) * 100} sx={{ height: 6 }} />
          <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant='overline' color='text.secondary'>
              Step {step + 1} of {STEP_IDS.length}
            </Typography>
            <Typography variant='h5' component='h2' sx={{ fontWeight: 800, mb: 1, fontSize: { xs: 22, md: 26 }, color: 'primary.dark' }}>
              {SECTIONS[stepId].title}
            </Typography>

            <StepComponent form={form} set={set} errors={errors} goTo={goTo} />

            {errorCount > 0 && (
              <Alert severity='warning' sx={{ mt: 2 }}>
                {errorCount === 1 ? 'One question needs an answer' : `${errorCount} questions need answers`} before you can continue — they’re highlighted above.
              </Alert>
            )}
            {submitError && (
              <Alert severity='error' sx={{ mt: 2 }}>
                We couldn’t send your suggestion: {submitError}. Your answers are still saved — please try again.
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, pt: 2, borderTop: 1, borderColor: 'divider', gap: 1 }}>
              <Button startIcon={<Icons.ArrowBack />} disabled={step === 0} onClick={() => goTo(step - 1)} sx={{ textTransform: 'none' }}>
                Back
              </Button>
              <Typography variant='caption' color='text.secondary' sx={{ display: { xs: 'none', sm: 'block' } }}>
                Your answers are saved in this browser
              </Typography>
              {isReview ? (
                <Button
                  variant='contained'
                  size='large'
                  disabled={submitting}
                  onClick={handleSubmit}
                  startIcon={submitting ? <CircularProgress size={18} color='inherit' /> : <Icons.Send />}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  {submitting ? 'Sending…' : 'Send suggestion'}
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {/* After "Edit" from the review page, jump straight back instead of clicking through every step */}
                  {maxVisited === STEP_IDS.length - 1 && step < STEP_IDS.length - 2 && (
                    <Button variant='outlined' onClick={() => handleNext(STEP_IDS.length - 1)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                      Back to review
                    </Button>
                  )}
                  <Button variant='contained' endIcon={<Icons.ArrowForward />} onClick={() => handleNext()} sx={{ textTransform: 'none', fontWeight: 700 }}>
                    {step === STEP_IDS.length - 2 ? 'Review answers' : 'Continue'}
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
