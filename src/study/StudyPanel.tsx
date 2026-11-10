import * as React from 'react';
import {
  Alert,
  Box,
  Button,
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
import { FOUND_OPTIONS, StopAnswers, STUDY_WORKFLOWS, workflowById } from './workflows';
import { useCurrentLanguage, useT } from '../i18n';
import { useTheme } from '@mui/material';
import { useLeftDrawer } from '../components/layout/store';
import { useFullScreen } from '../hooks';

/*
 * The study panel for MIND study participants (accounts with the `analytics`
 * role): a small card in the bottom-left corner of every page.
 *   idle    → "Start a trial" → pick a task → the timer starts
 *   running → the task, the timer, Stop (→ questions) and Cancel
 * Everyone else never sees it, and nothing is recorded for them.
 */

const formatClock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

const useClock = (since: number | undefined, frozenAt: number | undefined) => {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    if (!since || frozenAt) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [since, frozenAt]);
  return since ? (frozenAt ?? now) - since : 0;
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

  const elapsed = useClock(run?.started, run?.stoppedAt);
  const [minimized, setMinimized] = React.useState(false);
  const [pickOpen, setPickOpen] = React.useState(false);
  // Stop was pressed (possibly before a reload): the questions are showing.
  const stopOpen = run?.stoppedAt !== undefined;
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [thanks, setThanks] = React.useState(false);

  const workflow = workflowById(run?.workflowId);

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
          <Icons.Timer fontSize='small' />
          <Typography sx={{ fontWeight: 700, fontSize: 13, flex: 1 }}>{run ? formatClock(elapsed) : t('Study session')}</Typography>
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
                    {t(workflow.task)}
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
                  {t('Press Start when you are ready to begin a task. A timer will run until you press Stop.')}
                </Typography>
                <Button
                  variant='contained'
                  fullWidth
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
          studyTracker.start(email, w, lang);
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
          {t('Pick the task the study team asked you to do. The timer starts when you press Start.')}
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
                {t(w.task)}
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

  const valid = answers.found !== undefined && answers.ease !== undefined;

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      await studyTracker.stop({ ...answers, app: answers.app?.trim() || undefined, suggestions: answers.suggestions?.trim() || undefined });
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

        <Typography sx={{ fontWeight: 600, mt: 2.5 }}>{t('Overall, how easy or difficult was this task?')}</Typography>
        <ToggleButtonGroup exclusive size='small' color='primary' value={answers.ease ?? null} onChange={(_, v) => v && setAnswers(a => ({ ...a, ease: v }))} sx={{ mt: 1, flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5, 6, 7].map(n => (
            <ToggleButton key={n} value={n} sx={{ width: 44 }} aria-label={String(n)}>
              {n}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: 7 * 44, mt: 0.5 }}>
          <Typography variant='caption' color='text.secondary'>
            {t('Very difficult')}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {t('Very easy')}
          </Typography>
        </Box>

        <Typography sx={{ fontWeight: 600, mt: 2.5 }}>{t('Anything confusing, or any suggestions? (optional)')}</Typography>
        <TextField
          multiline
          minRows={2}
          maxRows={6}
          fullWidth
          value={answers.suggestions ?? ''}
          onChange={e => setAnswers(a => ({ ...a, suggestions: e.target.value.slice(0, 2000) }))}
          sx={{ mt: 1 }}
        />
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
