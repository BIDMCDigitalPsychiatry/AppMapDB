import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Radio,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from '@mui/material';
import * as Icons from '@mui/icons-material';
import { studyTracker } from './tracker';
import { useIsAnalyticsUser, useStudyObservers, useStudyRun, useUserEmailRaw } from './hooks';
import { FOUND_OPTIONS, StopAnswers, StudyWorkflow, STUDY_WORKFLOWS, workflowById } from './workflows';
import { useCurrentLanguage, useT } from '../i18n';
import { useTheme } from '@mui/material';
import { useAssistantPanel, useLeftDrawer } from '../components/layout/store';
import { useChangeRoute } from '../components/layout/hooks';
import { useHandleTableReset } from '../components/application/GenericTable/store';
import { useFullScreen } from '../hooks';
import { publicUrl } from '../helpers';
import { assistantEnabled } from '../components/pages/SearchAssistant/config';

/*
 * The study panel for MIND study participants (accounts with the `analytics`
 * role): a small card in the bottom-left corner of every page.
 *   idle    → "Start a trial" → pick a task → the page is reset, then the trial starts
 *   running → "Trial in Progress…", the task, Stop (→ question) and Cancel
 * The elapsed time is recorded but never shown, so it can't change how
 * participants behave (study team request, 2026-11).
 * Everyone else never sees it, and nothing is recorded for them.
 */

// The task text with its key phrase ("filter function" / "AI search
// assistant") underlined. Falls back to plain text if a translation doesn't
// contain the phrase.
export const TaskText = ({ workflow }: { workflow: StudyWorkflow }) => {
  const t = useT();
  const task = t(workflow.task);
  const em = t(workflow.emphasis);
  const i = em ? task.indexOf(em) : -1;
  if (i < 0) return <>{task}</>;
  return (
    <>
      {task.slice(0, i)}
      <Box component='span' sx={{ fontWeight: 700, textDecoration: 'underline' }}>
        {em}
      </Box>
      {task.slice(i + em.length)}
    </>
  );
};

export default function StudyPanel() {
  const isAnalytics = useIsAnalyticsUser();
  if (!isAnalytics) return null;
  return <StudyPanelInner />;
}

function StudyPanelInner() {
  const t = useT();
  const lang = useCurrentLanguage();
  const email = useUserEmailRaw();
  const storedRun = useStudyRun();
  // A run persisted by another account on this browser isn't ours to show.
  const run = storedRun && storedRun.email === email.toLowerCase() ? storedRun : undefined;
  useStudyObservers(run !== undefined);

  const [minimized, setMinimized] = React.useState(false);
  const [pickOpen, setPickOpen] = React.useState(false);
  // Stop was pressed (possibly before a reload): the questions are showing.
  const stopOpen = run?.stoppedAt !== undefined;
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [thanks, setThanks] = React.useState(false);

  const workflow = workflowById(run?.workflowId);

  // Starting a trial first resets the page: back to the app library, all
  // filters and the search box cleared, and the filter panel / search
  // assistant opened or minimized to suit the task. The run only starts once
  // that has rendered, so none of the reset is recorded as part of the trial.
  const resetFilters = useHandleTableReset('Applications');
  const changeRoute = useChangeRoute();
  const [, setDrawerOpen] = useLeftDrawer();
  const [, setAssistantOpen] = useAssistantPanel();
  const [pendingStart, setPendingStart] = React.useState<StudyWorkflow | undefined>(undefined);
  const beginTrial = (w: StudyWorkflow) => {
    resetFilters();
    changeRoute(publicUrl('/Apps'));
    setDrawerOpen(w.setup.filters === 'open');
    setAssistantOpen(assistantEnabled && w.setup.assistant === 'open');
    setPendingStart(w);
  };
  React.useEffect(() => {
    if (!pendingStart) return;
    // A short delay lets every component's effects for the reset run (and be
    // ignored, as no run is active yet) before the run begins.
    const timer = setTimeout(() => {
      studyTracker.start(email, pendingStart, lang);
      setPendingStart(undefined);
    }, 150);
    return () => clearTimeout(timer);
  }, [pendingStart]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sit just right of the docked filter menu so it never covers filters.
  const { layout } = useTheme() as any;
  const [drawerOpen] = useLeftDrawer();
  const fullScreen = useFullScreen();
  const left = !fullScreen && drawerOpen ? (layout?.leftDrawerWidth ?? 0) + 16 : 16;

  return (
    <>
      <Paper
        elevation={6}
        role='region'
        aria-label={t('Study session')}
        sx={{ position: 'fixed', left, bottom: 16, zIndex: 1300, width: minimized ? 'auto' : 300, maxWidth: 'calc(100vw - 32px)', borderRadius: 3, overflow: 'hidden' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75, bgcolor: 'primary.dark', color: 'common.white' }}>
          {run || pendingStart ? <CircularProgress size={14} thickness={6} sx={{ color: 'inherit' }} aria-hidden /> : <Icons.Assignment fontSize='small' />}
          <Typography sx={{ fontWeight: 700, fontSize: 13, flex: 1 }} role='status'>
            {run || pendingStart ? t('Trial in Progress…') : t('Study session')}
          </Typography>
          <Tooltip title={minimized ? t('Show') : t('Minimize')}>
            <IconButton size='small' onClick={() => setMinimized(m => !m)} sx={{ color: 'inherit' }} aria-label={minimized ? t('Show') : t('Minimize')}>
              {minimized ? <Icons.ExpandLess fontSize='small' /> : <Icons.ExpandMore fontSize='small' />}
            </IconButton>
          </Tooltip>
        </Box>
        {!minimized && (
          <Box sx={{ p: 1.5 }}>
            {run ? (
              <>
                <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: 'primary.main' }}>
                  {t(workflow?.label ?? run.workflowLabel)}
                </Typography>
                {workflow && (
                  <Typography variant='body2' sx={{ mt: 0.5, color: 'text.secondary' }}>
                    <TaskText workflow={workflow} />
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                  <Button variant='contained' color='primary' onClick={() => studyTracker.pressStop()} startIcon={<Icons.Stop />} sx={{ textTransform: 'none', fontWeight: 700 }}>
                    {t('Stop')}
                  </Button>
                  <Button size='small' onClick={() => setCancelOpen(true)} sx={{ textTransform: 'none', ml: 'auto' }} color='inherit'>
                    {t('Cancel trial')}
                  </Button>
                </Box>
              </>
            ) : (
              <>
                {thanks && (
                  <Alert severity='success' sx={{ mb: 1, py: 0 }} onClose={() => setThanks(false)}>
                    {t('Thank you — your answers were saved.')}
                  </Alert>
                )}
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  {t('Press Start when you are ready to begin a task, and press Stop when you are done.')}
                </Typography>
                <Button
                  variant='contained'
                  fullWidth
                  disabled={!!pendingStart}
                  startIcon={<Icons.PlayArrow />}
                  onClick={() => {
                    setThanks(false);
                    setPickOpen(true);
                  }}
                  sx={{ mt: 1.5, textTransform: 'none', fontWeight: 700 }}
                >
                  {t('Start a trial')}
                </Button>
              </>
            )}
          </Box>
        )}
      </Paper>

      <PickTaskDialog
        open={pickOpen}
        onClose={() => setPickOpen(false)}
        onStart={w => {
          beginTrial(w);
          setPickOpen(false);
          setMinimized(false);
        }}
      />
      <StopDialog open={stopOpen} onClose={() => studyTracker.undoStop()} onDone={() => setThanks(true)} />
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)}>
        <DialogTitle>{t('Cancel this trial?')}</DialogTitle>
        <DialogContent>
          <Typography>{t('The trial will be marked as cancelled and you will not be asked any questions.')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)} sx={{ textTransform: 'none' }}>
            {t('Keep going')}
          </Button>
          <Button
            color='error'
            sx={{ textTransform: 'none' }}
            onClick={() => {
              setCancelOpen(false);
              studyTracker.cancel().catch(err => console.warn('Cancel not saved yet:', err));
            }}
          >
            {t('Cancel trial')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function PickTaskDialog({ open, onClose, onStart }) {
  const t = useT();
  const [selected, setSelected] = React.useState<string>('');
  const workflow = workflowById(selected);
  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>{t('Choose a task')}</DialogTitle>
      <DialogContent dividers>
        <Typography variant='body2' sx={{ mb: 1.5, color: 'text.secondary' }}>
          {t('Pick the task the study team asked you to do. The trial starts when you press Start.')}
        </Typography>
        {STUDY_WORKFLOWS.map(w => (
          <Paper
            key={w.id}
            variant='outlined'
            onClick={() => setSelected(w.id)}
            sx={{
              display: 'flex',
              gap: 1,
              p: 1,
              mb: 1,
              cursor: 'pointer',
              borderRadius: 2,
              borderColor: selected === w.id ? 'primary.main' : undefined,
              bgcolor: selected === w.id ? 'primary.light' : undefined
            }}
          >
            <Radio checked={selected === w.id} size='small' sx={{ p: 0.5, alignSelf: 'flex-start' }} inputProps={{ 'aria-label': t(w.label) }} />
            <Box>
              <Typography sx={{ fontWeight: 700 }}>{t(w.label)}</Typography>
              <Typography variant='body2' color='text.secondary'>
                <TaskText workflow={w} />
              </Typography>
            </Box>
          </Paper>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          {t('Cancel')}
        </Button>
        <Button variant='contained' disabled={!workflow} onClick={() => workflow && onStart(workflow)} startIcon={<Icons.PlayArrow />} sx={{ textTransform: 'none' }}>
          {t('Start')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function StopDialog({ open, onClose, onDone }) {
  const t = useT();
  const [answers, setAnswers] = React.useState<StopAnswers>({});
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  // Pre-fill "which app" with the last app page they opened during the trial.
  React.useEffect(() => {
    if (!open) return;
    setError('');
    const lastApp = studyTracker.lastAppName();
    setAnswers(a => ({ ...a, app: a.app || lastApp || '' }));
  }, [open]);

  const valid = answers.found !== undefined;

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      await studyTracker.stop({ found: answers.found, app: answers.found === 'no' ? undefined : answers.app?.trim() || undefined });
      setAnswers({});
      onDone();
    } catch {
      setError(t('Your answers could not be saved. Check your connection and press Submit again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth='sm' fullWidth>
      <DialogTitle>{t('A few quick questions')}</DialogTitle>
      <DialogContent dividers>
        <Typography sx={{ fontWeight: 600 }}>{t('Did you find an app that fits the task?')}</Typography>
        <ToggleButtonGroup exclusive size='small' color='primary' value={answers.found ?? null} onChange={(_, v) => v && setAnswers(a => ({ ...a, found: v }))} sx={{ mt: 1 }}>
          {FOUND_OPTIONS.map(o => (
            <ToggleButton key={o.value} value={o.value} sx={{ textTransform: 'none', px: 2 }}>
              {t(o.label)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {answers.found !== 'no' && (
          <>
            <Typography sx={{ fontWeight: 600, mt: 2.5 }}>{t('Which app did you choose?')}</Typography>
            <TextField size='small' fullWidth value={answers.app ?? ''} onChange={e => setAnswers(a => ({ ...a, app: e.target.value.slice(0, 200) }))} sx={{ mt: 1 }} />
          </>
        )}

        {error && (
          <Alert severity='error' sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving} sx={{ textTransform: 'none' }}>
          {t('Back to the task')}
        </Button>
        <Button variant='contained' disabled={!valid || saving} onClick={submit} sx={{ textTransform: 'none' }}>
          {saving ? t('Saving…') : t('Submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
