import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import * as Icons from '@mui/icons-material';
import { deleteStudyRuns, exportStudyEvents, getRunEvents, listStudyRuns, saveRunNotes, StudyEvent, StudyRun } from '../../../study/api';
import { codebookCsv, displayStatus, downloadText, eventsCsv, RunSort, runsCsv, sortRuns, summarizeByWorkflow, transcriptCsv } from '../../../study/report';
import { CODEBOOK, CODEBOOK_SECTIONS } from '../../../study/codebook';
import { STUDY_WORKFLOWS } from '../../../study/workflows';
import { isNoCurrentUserError, sessionExpired, SESSION_EXPIRED_MESSAGE } from '../../../database/session';
import { useDispatch } from 'react-redux';
import { tx, useT } from '../../../i18n';

/*
 * Admin > Study Analytics (admins only; the write API re-checks). Shows the
 * MIND study's timed trials: a summary per task, every run, a step-by-step
 * timeline for any run (with the assistant transcript and notes), CSV
 * exports, a codebook of every variable, and deleting selected runs.
 */

const SORT_LABELS: Record<RunSort, string> = {
  newest: tx('Newest first'),
  oldest: tx('Oldest first'),
  account: tx('Account (grouped)'),
  task: tx('Task (grouped)'),
  status: tx('Status (grouped)'),
  longest: tx('Longest first'),
  shortest: tx('Shortest first')
};

const fmtDuration = (ms?: number) => {
  if (ms === undefined || ms === null || Number.isNaN(ms)) return '–';
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  return m ? `${m}:${String(s % 60).padStart(2, '0')}` : `${s}s`;
};
const fmtNum = (v?: number, digits = 1) => (v === undefined || v === null || Number.isNaN(v) ? '–' : Number.isInteger(v) ? String(v) : v.toFixed(digits));
const fmtPct = (v?: number) => (v === undefined ? '–' : `${Math.round(v * 100)}%`);
const fmtDate = (t?: number) => (t ? new Date(t).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '–');
const dayStart = (d: string) => (d ? new Date(`${d}T00:00:00`).getTime() : undefined);
const dayEnd = (d: string) => (d ? new Date(`${d}T23:59:59.999`).getTime() : undefined);

const STATUS_COLOR: Record<string, 'success' | 'default' | 'warning' | 'info'> = {
  completed: 'success',
  cancelled: 'default',
  abandoned: 'warning',
  'in progress': 'info'
};

// The date fields' labels float above the box, onto the blue header — give
// them a white pill and dark text so they stay readable.
const dateLabelProps = {
  shrink: true,
  sx: { color: 'primary.dark', fontWeight: 700, bgcolor: 'background.paper', px: 0.75, borderRadius: 1, '&.Mui-focused': { color: 'primary.dark' } }
};

export default function StudyAnalytics({ height = undefined as number | undefined }) {
  const t = useT();
  const dispatch = useDispatch();
  const [state, setState] = React.useState({ loading: true, error: '', runs: [] as StudyRun[] });
  const [filters, setFilters] = React.useState({ workflow: '', account: '', from: '', to: '', hideTestAccount: false });
  const [openRun, setOpenRun] = React.useState<StudyRun | undefined>();
  const [exporting, setExporting] = React.useState('');
  const [sort, setSort] = React.useState<RunSort>('newest');
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set());
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState('');
  const [codebookOpen, setCodebookOpen] = React.useState(false);

  // The page scrolls inside this box (Admin pages don't scroll as a whole), so
  // it must end exactly at the bottom of the window. Measured rather than
  // computed from header heights, which left the last runs out of reach.
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [fitHeight, setFitHeight] = React.useState<number | undefined>(undefined);
  React.useLayoutEffect(() => {
    const measure = () => {
      const el = scrollRef.current;
      if (el) setFitHeight(Math.max(240, Math.floor(window.innerHeight - el.getBoundingClientRect().top)));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [height]);

  const handleError = React.useCallback(
    (err: any) => {
      if (isNoCurrentUserError(err)) {
        dispatch(sessionExpired() as any);
        return SESSION_EXPIRED_MESSAGE;
      }
      return err?.message ?? String(err);
    },
    [dispatch]
  );

  const load = React.useCallback(() => {
    setState(s => ({ ...s, loading: true, error: '' }));
    listStudyRuns()
      .then(runs => setState({ loading: false, error: '', runs }))
      .catch(err => setState({ loading: false, error: handleError(err), runs: [] }));
  }, [handleError]);

  React.useEffect(load, [load]);

  const runs = React.useMemo(() => {
    const from = dayStart(filters.from);
    const to = dayEnd(filters.to);
    const account = filters.account.trim().toLowerCase();
    return state.runs.filter(
      r =>
        (!filters.workflow || r.workflowId === filters.workflow) &&
        (!account || r.email.includes(account)) &&
        (!from || r.started >= from) &&
        (!to || r.started <= to) &&
        (!filters.hideTestAccount || !r.email.startsWith('test_subject@'))
    );
  }, [state.runs, filters]);

  const byWorkflow = React.useMemo(() => summarizeByWorkflow(runs), [runs]);
  const accounts = new Set(runs.map(r => r.email)).size;
  const sortedRuns = React.useMemo(() => sortRuns(runs, sort), [runs, sort]);
  const accountList = React.useMemo(() => Array.from(new Set(runs.map(r => r.email))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })), [runs]);

  // Only runs shown under the current filters can be selected / deleted.
  const selectedRuns = runs.filter(r => selected.has(r._id));
  const allSelected = runs.length > 0 && selectedRuns.length === runs.length;
  const toggleRun = (id: string) =>
    setSelected(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const selectAll = (on: boolean) => setSelected(on ? new Set(runs.map(r => r._id)) : new Set());
  const selectAccount = (email: string) => setSelected(s => new Set([...Array.from(s), ...runs.filter(r => r.email === email).map(r => r._id)]));

  const deleteSelected = async () => {
    const ids = selectedRuns.map(r => r._id);
    setDeleting(t('Deleting… {{count}}', { count: 0 }));
    try {
      await deleteStudyRuns(ids, n => setDeleting(t('Deleting… {{count}}', { count: n })));
      const gone = new Set(ids);
      setState(s => ({ ...s, runs: s.runs.filter(r => !gone.has(r._id)) }));
      setSelected(new Set());
      setConfirmDelete(false);
    } catch (err) {
      setState(s => ({ ...s, error: handleError(err) }));
      setConfirmDelete(false);
      load(); // some runs may have been deleted before the error
    } finally {
      setDeleting('');
    }
  };

  const onNotesSaved = (id: string, notes: string) => {
    setState(s => ({ ...s, runs: s.runs.map(r => (r._id === id ? { ...r, notes, notesUpdated: Date.now(), notesBy: undefined } : r)) }));
    setOpenRun(r => (r && r._id === id ? { ...r, notes, notesUpdated: Date.now(), notesBy: undefined } : r));
  };

  const exportRuns = () => downloadText(`mindapps-study-runs-${new Date().toISOString().slice(0, 10)}.csv`, runsCsv(runs));

  // Both the events CSV and the assistant-transcripts CSV are built from the full event export.
  const exportFromEvents = async (kind: 'events' | 'transcripts') => {
    setExporting(t('Downloading events…'));
    try {
      const ids = new Set(runs.map(r => r._id));
      const all = (await exportStudyEvents(n => setExporting(t('Downloading events… {{count}}', { count: n })))).filter(e => ids.has(e.runId ?? ''));
      const day = new Date().toISOString().slice(0, 10);
      if (kind === 'events') downloadText(`mindapps-study-events-${day}.csv`, eventsCsv(all, runs));
      else downloadText(`mindapps-study-assistant-transcripts-${day}.csv`, transcriptCsv(all, runs));
      setExporting('');
    } catch (err) {
      setExporting('');
      setState(s => ({ ...s, error: handleError(err) }));
    }
  };

  // Current task names win over the names stored on older runs (tasks get renamed).
  const workflowOptions = Array.from(new Map([...state.runs.map(r => [r.workflowId, r.workflowLabel ?? r.workflowId] as const), ...STUDY_WORKFLOWS.map(w => [w.id, w.label] as const)]).entries());

  return (
    <Box ref={scrollRef} sx={{ height: fitHeight ?? height, overflowY: 'auto', bgcolor: 'background.default' }}>
      <Box sx={{ px: { xs: 2, sm: 4 }, py: 2, bgcolor: 'primary.light' }}>
        <Typography sx={{ fontSize: 30, lineHeight: 1.2, fontWeight: 900, color: 'primary.dark' }}>{t('Study Analytics')}</Typography>
        <Typography variant='body2' color='text.secondary'>
          {t('Timed trials by MIND study participants (accounts with the Analytics User role). Times are from Start to Stop.')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', mt: 2 }}>
          <TextField select size='small' label={t('Task')} value={filters.workflow} onChange={e => setFilters(f => ({ ...f, workflow: e.target.value }))} sx={{ minWidth: 200, bgcolor: 'background.paper' }}>
            <MenuItem value=''>{t('All tasks')}</MenuItem>
            {workflowOptions.map(([id, label]) => (
              <MenuItem key={id} value={id}>
                {t(label)}
              </MenuItem>
            ))}
          </TextField>
          <TextField size='small' label={t('Account contains')} value={filters.account} onChange={e => setFilters(f => ({ ...f, account: e.target.value }))} sx={{ bgcolor: 'background.paper' }} />
          <TextField size='small' type='date' label={t('From')} InputLabelProps={dateLabelProps} value={filters.from} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} sx={{ bgcolor: 'background.paper' }} />
          <TextField size='small' type='date' label={t('To')} InputLabelProps={dateLabelProps} value={filters.to} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} sx={{ bgcolor: 'background.paper' }} />
          <FormControlLabel
            control={<Switch size='small' checked={filters.hideTestAccount} onChange={e => setFilters(f => ({ ...f, hideTestAccount: e.target.checked }))} />}
            label={<Typography variant='body2'>{t('Hide test_subject')}</Typography>}
          />
          <Box sx={{ flex: 1 }} />
          <Button size='small' startIcon={<Icons.MenuBook />} onClick={() => setCodebookOpen(true)} sx={{ textTransform: 'none' }}>
            {t('Codebook')}
          </Button>
          <Button size='small' startIcon={<Icons.Refresh />} onClick={load} sx={{ textTransform: 'none' }}>
            {t('Refresh')}
          </Button>
          <Button size='small' variant='outlined' startIcon={<Icons.Download />} disabled={runs.length === 0} onClick={exportRuns} sx={{ textTransform: 'none', bgcolor: 'background.paper' }}>
            {t('Runs CSV')}
          </Button>
          <Button
            size='small'
            variant='outlined'
            startIcon={exporting ? <CircularProgress size={14} /> : <Icons.Download />}
            disabled={runs.length === 0 || !!exporting}
            onClick={() => exportFromEvents('events')}
            sx={{ textTransform: 'none', bgcolor: 'background.paper' }}
          >
            {exporting || t('Events CSV')}
          </Button>
          <Button
            size='small'
            variant='outlined'
            startIcon={<Icons.Download />}
            disabled={runs.length === 0 || !!exporting}
            onClick={() => exportFromEvents('transcripts')}
            sx={{ textTransform: 'none', bgcolor: 'background.paper' }}
          >
            {t('Assistant transcripts CSV')}
          </Button>
        </Box>
      </Box>

      <Box sx={{ px: { xs: 2, sm: 4 }, pt: 2, pb: 6 }}>
        {state.error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {t('Could not load study analytics: {{error}}', { error: state.error })}
          </Alert>
        )}
        {state.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : state.runs.length === 0 && !state.error ? (
          <Paper variant='outlined' sx={{ p: 4, textAlign: 'center' }}>
            <Icons.Timer color='primary' sx={{ fontSize: 40 }} />
            <Typography sx={{ mt: 1, fontWeight: 700 }}>{t('No trials yet')}</Typography>
            <Typography variant='body2' color='text.secondary'>
              {t('Runs appear here as soon as a participant presses Start.')}
            </Typography>
          </Paper>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Stat label={t('Runs')} value={String(runs.length)} />
              <Stat label={t('Completed')} value={String(runs.filter(r => r.status === 'completed').length)} />
              <Stat label={t('Participants')} value={String(accounts)} />
              <Stat label={t('Median time (completed)')} value={fmtDuration(median(runs.filter(r => r.status === 'completed').map(r => r.summary?.durationMs)))} />
            </Box>

            <Typography variant='h6' sx={{ fontWeight: 800, color: 'primary.dark', mb: 1 }}>
              {t('By task')}
            </Typography>
            <TableContainer component={Paper} variant='outlined' sx={{ mb: 3 }}>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Task')}</TableCell>
                    <Th label={t('Runs')} />
                    <Th label={t('Completed')} info={t('Share of finished runs that were completed (not cancelled or abandoned).')} />
                    <Th label={t('Median time')} />
                    <Th label={t('Mean time')} />
                    <Th label={t('To first app')} info={t('Median time from Start to the first app page opened.')} />
                    <Th label={t('Found it')} info={t('Share answering "Yes" to "Did you find an app that fits the task?"')} />
                    <Th label={t('Ease (1–7)')} info={t('Mean Single Ease Question score: 1 = very difficult, 7 = very easy.')} />
                    <Th label={t('Assistant turns')} />
                    <Th label={t('Assistant wait')} info={t('Mean chatbot loading time per message.')} />
                    <Th label={t('Filter checks')} />
                    <Th label={t('Unchecks')} />
                    <Th label={t('Hovers')} />
                    <Th label={t('Scroll: filters')} info={t('Mean time spent scrolling the filter menu.')} />
                    <Th label={t('Scroll: library')} info={t('Mean time spent scrolling the app library.')} />
                    <Th label={t('Apps opened')} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {byWorkflow.map(w => (
                    <TableRow key={w.workflowId} hover>
                      <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{t(w.workflowLabel)}</TableCell>
                      <Td>{w.runs}</Td>
                      <Td>
                        {w.completed} ({fmtPct(w.completionRate)})
                      </Td>
                      <Td>{fmtDuration(w.medianDurationMs)}</Td>
                      <Td>{fmtDuration(w.meanDurationMs)}</Td>
                      <Td>{fmtDuration(w.medianTimeToFirstAppMs)}</Td>
                      <Td>{fmtPct(w.foundYesRate)}</Td>
                      <Td>{fmtNum(w.meanEase)}</Td>
                      <Td>{fmtNum(w.meanAssistantTurns)}</Td>
                      <Td>{w.meanAssistantWaitMs === undefined ? '–' : `${(w.meanAssistantWaitMs / 1000).toFixed(1)}s`}</Td>
                      <Td>{fmtNum(w.meanFilterChecks)}</Td>
                      <Td>{fmtNum(w.meanFilterUnchecks)}</Td>
                      <Td>{fmtNum(w.meanFilterHovers)}</Td>
                      <Td>{fmtDuration(w.meanScrollFiltersMs)}</Td>
                      <Td>{fmtDuration(w.meanScrollLibraryMs)}</Td>
                      <Td>{fmtNum(w.meanAppOpens)}</Td>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant='h6' sx={{ fontWeight: 800, color: 'primary.dark', mb: 1 }}>
              {t('Runs')}{' '}
              <Typography component='span' variant='body2' color='text.secondary'>
                {t('Click a run to see its timeline and add notes.')}
              </Typography>
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', mb: 1 }}>
              <TextField select size='small' label={t('Sort by')} value={sort} onChange={e => setSort(e.target.value as RunSort)} sx={{ minWidth: 190 }}>
                {(Object.keys(SORT_LABELS) as RunSort[]).map(k => (
                  <MenuItem key={k} value={k}>
                    {t(SORT_LABELS[k])}
                  </MenuItem>
                ))}
              </TextField>
              <TextField select size='small' label={t('Select all runs from')} value='' onChange={e => selectAccount(e.target.value)} sx={{ minWidth: 230 }}>
                {accountList.map(a => (
                  <MenuItem key={a} value={a}>
                    {a} ({runs.filter(r => r.email === a).length})
                  </MenuItem>
                ))}
              </TextField>
              {selectedRuns.length > 0 && (
                <>
                  <Typography variant='body2' sx={{ fontWeight: 700 }}>
                    {t('{{count}} selected', { count: selectedRuns.length })}
                  </Typography>
                  <Button size='small' onClick={() => selectAll(false)} sx={{ textTransform: 'none' }}>
                    {t('Clear selection')}
                  </Button>
                  <Button size='small' variant='contained' color='error' startIcon={<Icons.DeleteOutline />} onClick={() => setConfirmDelete(true)} sx={{ textTransform: 'none' }}>
                    {t('Delete selected')}
                  </Button>
                </>
              )}
            </Box>
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell padding='checkbox'>
                      <Checkbox
                        size='small'
                        checked={allSelected}
                        indeterminate={selectedRuns.length > 0 && !allSelected}
                        onChange={e => selectAll(e.target.checked)}
                        inputProps={{ 'aria-label': t('Select all runs') }}
                      />
                    </TableCell>
                    <TableCell>{t('Started')}</TableCell>
                    <TableCell>{t('Account')}</TableCell>
                    <TableCell>{t('Task')}</TableCell>
                    <TableCell>{t('Status')}</TableCell>
                    <Th label={t('Time')} />
                    <Th label={t('Found')} />
                    <TableCell>{t('App chosen')}</TableCell>
                    <Th label={t('Ease')} />
                    <Th label={t('Turns')} />
                    <Th label={t('Checks')} />
                    <Th label={t('Apps opened')} />
                    <TableCell>{t('Notes')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedRuns.map(r => {
                    const status = displayStatus(r);
                    return (
                      <TableRow key={r._id} hover selected={selected.has(r._id)} onClick={() => setOpenRun(r)} sx={{ cursor: 'pointer' }}>
                        <TableCell padding='checkbox' onClick={e => e.stopPropagation()}>
                          <Checkbox size='small' checked={selected.has(r._id)} onChange={() => toggleRun(r._id)} inputProps={{ 'aria-label': t('Select run') }} />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fmtDate(r.started)}</TableCell>
                        <TableCell>{r.email}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{t(r.workflowLabel ?? r.workflowId)}</TableCell>
                        <TableCell>
                          <Chip size='small' label={t(status)} color={STATUS_COLOR[status]} variant={status === 'completed' ? 'filled' : 'outlined'} />
                        </TableCell>
                        <Td>{fmtDuration(r.summary?.durationMs ?? (r.ended ? r.ended - r.started : undefined))}</Td>
                        <Td>{r.answers?.found ? t(r.answers.found === 'yes' ? 'Yes' : r.answers.found === 'no' ? 'No' : 'Partly') : '–'}</Td>
                        <TableCell>{r.answers?.app ?? '–'}</TableCell>
                        <Td>{r.answers?.ease ?? '–'}</Td>
                        <Td>{r.summary?.assistantTurns ?? '–'}</Td>
                        <Td>{r.summary?.filterChecks ?? '–'}</Td>
                        <Td>{r.summary?.appOpens ?? '–'}</Td>
                        <TableCell sx={{ maxWidth: 220 }}>
                          {r.notes ? (
                            <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{r.notes}</span>} arrow>
                              <Typography variant='body2' noWrap>
                                {r.notes}
                              </Typography>
                            </Tooltip>
                          ) : (
                            '–'
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
      {openRun && <RunDialog run={openRun} onClose={() => setOpenRun(undefined)} onError={handleError} onNotesSaved={onNotesSaved} />}
      <Dialog open={confirmDelete} onClose={deleting ? undefined : () => setConfirmDelete(false)}>
        <DialogTitle>{t('Delete {{count}} runs?', { count: selectedRuns.length })}</DialogTitle>
        <DialogContent>
          <Typography>{t('This permanently deletes the selected runs with all their recorded actions, assistant transcripts and notes. It cannot be undone.')}</Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            {Array.from(new Set(selectedRuns.map(r => r.email))).join(', ')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} disabled={!!deleting} sx={{ textTransform: 'none' }}>
            {t('Cancel')}
          </Button>
          <Button color='error' variant='contained' onClick={deleteSelected} disabled={!!deleting} sx={{ textTransform: 'none' }}>
            {deleting || t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
      <CodebookDialog open={codebookOpen} onClose={() => setCodebookOpen(false)} />
    </Box>
  );
}

const median = (values: (number | undefined)[]) => {
  const v = values.filter((x): x is number => typeof x === 'number').sort((a, b) => a - b);
  if (!v.length) return undefined;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <Paper variant='outlined' sx={{ px: 2, py: 1.25, minWidth: 140 }}>
    <Typography variant='caption' color='text.secondary'>
      {label}
    </Typography>
    <Typography sx={{ fontSize: 24, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
  </Paper>
);

const Th = ({ label, info }: { label: string; info?: string }) => (
  <TableCell align='right' sx={{ whiteSpace: 'nowrap' }}>
    {label}
    {info && (
      <Tooltip title={info} arrow>
        <Icons.InfoOutlined sx={{ fontSize: 14, ml: 0.5, verticalAlign: 'middle', color: 'text.secondary', cursor: 'help' }} />
      </Tooltip>
    )}
  </TableCell>
);

const Td = ({ children }: { children: React.ReactNode }) => (
  <TableCell align='right' sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
    {children}
  </TableCell>
);

// Human-readable line for one event on the run timeline.
const describe = (e: StudyEvent): string => {
  const d = e.data ?? {};
  const tag = [d.category, d.value].filter(Boolean).join(': ');
  switch (e.type) {
    case 'filter_check':
    case 'filter_uncheck':
      return `${tag}${d.source && d.source !== 'manual' ? ` (${d.source})` : ''}`;
    case 'filter_hover':
      return `${tag} · ${(d.durationMs / 1000).toFixed(1)}s`;
    case 'filter_clear':
    case 'filter_reset':
      return [d.scope === 'group' ? d.category : 'all filters', d.where].filter(Boolean).join(' · ');
    case 'filter_group_expand':
    case 'filter_group_collapse':
      return d.category ?? '';
    case 'scroll':
      return `${d.area} · ${(d.durationMs / 1000).toFixed(1)}s · at ${d.scrollTop ?? 0}px`;
    case 'app_open':
      return `${d.name ?? d.appId ?? ''}${d.from ? ` · from ${d.from}` : ''}`;
    case 'app_card_expand':
    case 'app_card_collapse':
      return d.name ?? '';
    case 'assistant_message':
      return `turn ${d.turn} · ${d.words} words${d.typingMs !== undefined ? ` · typed in ${(d.typingMs / 1000).toFixed(1)}s` : ''}`;
    case 'assistant_reply': {
      const tags = d.filters ? Object.values(d.filters as Record<string, string[]>).flat() : [];
      return `turn ${d.turn} · ${(d.latencyMs / 1000).toFixed(1)}s wait${d.applied ? ` · applied ${tags.length} filter${tags.length === 1 ? '' : 's'}` : ''}`;
    }
    case 'search_text':
      return d.text ? `“${d.text}”` : '(cleared)';
    case 'page_view':
      return d.page ?? '';
    case 'language_change':
      return `${d.from} → ${d.to}`;
    case 'run_start':
      return [d.language, d.viewport].filter(Boolean).join(' · ');
    case 'run_stop':
      return [d.found && `found: ${d.found}`, d.ease && `ease ${d.ease}/7`].filter(Boolean).join(' · ');
    default:
      return '';
  }
};

function CodebookDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>{t('Codebook')}</DialogTitle>
      <DialogContent dividers>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          {t('What each figure and CSV column means and how it is measured.')}
        </Typography>
        {CODEBOOK_SECTIONS.map(section => (
          <Box key={section} sx={{ mb: 2.5 }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 800, color: 'primary.dark', mb: 0.5 }}>
              {section}
            </Typography>
            <Table size='small'>
              <TableBody>
                {CODEBOOK.filter(e => e.section === section).map(e => (
                  <TableRow key={e.name}>
                    <TableCell sx={{ width: '30%', verticalAlign: 'top', fontFamily: 'monospace', fontSize: 13 }}>{e.name}</TableCell>
                    <TableCell sx={{ verticalAlign: 'top' }}>{e.definition}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button startIcon={<Icons.Download />} onClick={() => downloadText('mindapps-study-codebook.csv', codebookCsv())} sx={{ textTransform: 'none' }}>
          {t('Download codebook CSV')}
        </Button>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          {t('Close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function RunNotes({ run, onError, onSaved }: { run: StudyRun; onError: (e: any) => string; onSaved: (id: string, notes: string) => void }) {
  const t = useT();
  const [notes, setNotes] = React.useState(run.notes ?? '');
  const [status, setStatus] = React.useState<{ saving: boolean; error: string; saved: boolean }>({ saving: false, error: '', saved: false });
  const dirty = notes !== (run.notes ?? '');
  const save = () => {
    setStatus({ saving: true, error: '', saved: false });
    saveRunNotes(run._id, notes)
      .then(() => {
        onSaved(run._id, notes);
        setStatus({ saving: false, error: '', saved: true });
      })
      .catch(err => setStatus({ saving: false, error: onError(err), saved: false }));
  };
  return (
    <Paper variant='outlined' sx={{ p: 1.5, mb: 2 }}>
      <Typography variant='subtitle2' sx={{ fontWeight: 800 }}>
        {t('Notes')}
      </Typography>
      <TextField
        multiline
        minRows={2}
        maxRows={8}
        fullWidth
        size='small'
        placeholder={t('Notes about this run (only the study team sees these)')}
        value={notes}
        onChange={e => {
          setNotes(e.target.value.slice(0, 4000));
          setStatus(s => ({ ...s, saved: false }));
        }}
        sx={{ mt: 1 }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
        <Button size='small' variant='contained' disabled={!dirty || status.saving} onClick={save} sx={{ textTransform: 'none' }}>
          {status.saving ? t('Saving…') : t('Save notes')}
        </Button>
        {status.saved && !dirty && (
          <Typography variant='body2' color='success.main'>
            {t('Saved')}
          </Typography>
        )}
        {run.notesBy && !dirty && (
          <Typography variant='caption' color='text.secondary'>
            {run.notesBy} · {fmtDate(run.notesUpdated)}
          </Typography>
        )}
      </Box>
      {status.error && (
        <Alert severity='error' sx={{ mt: 1 }}>
          {status.error}
        </Alert>
      )}
    </Paper>
  );
}

function RunDialog({
  run,
  onClose,
  onError,
  onNotesSaved
}: {
  run: StudyRun;
  onClose: () => void;
  onError: (e: any) => string;
  onNotesSaved: (id: string, notes: string) => void;
}) {
  const t = useT();
  const [state, setState] = React.useState({ loading: true, error: '', events: [] as StudyEvent[] });
  const [showScroll, setShowScroll] = React.useState(true);

  React.useEffect(() => {
    getRunEvents(run._id)
      .then(events => setState({ loading: false, error: '', events }))
      .catch(err => setState({ loading: false, error: onError(err), events: [] }));
  }, [run._id, onError]);

  const transcript = state.events.filter(e => (e.type === 'assistant_message' || e.type === 'assistant_reply') && e.data?.text);
  const shown = state.events.filter(e => showScroll || e.type !== 'scroll');
  const s = run.summary;

  return (
    <Dialog open onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>
        {t(run.workflowLabel ?? run.workflowId)} · {run.email}
        <Typography variant='body2' color='text.secondary'>
          {fmtDate(run.started)} · {t(displayStatus(run))} · {fmtDuration(s?.durationMs ?? (run.ended ? run.ended - run.started : undefined))}
          {run.language ? ` · ${run.language.toUpperCase()}` : ''}
          {run.device ? ` · ${run.device}` : ''}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {run.answers && (
          <Paper variant='outlined' sx={{ p: 1.5, mb: 2 }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 800 }}>
              {t('Answers after Stop')}
            </Typography>
            <Typography variant='body2'>
              {t('Found an app')}: <b>{run.answers.found ?? '–'}</b> · {t('App chosen')}: <b>{run.answers.app ?? '–'}</b> · {t('Ease')}: <b>{run.answers.ease ?? '–'}</b> / 7
            </Typography>
            {run.answers.suggestions && (
              <Typography variant='body2' sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                {t('Suggestions')}: {run.answers.suggestions}
              </Typography>
            )}
          </Paper>
        )}
        <RunNotes run={run} onError={onError} onSaved={onNotesSaved} />
        {s && (
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            {t('Filters')}: {s.filterChecks} {t('checks')}, {s.filterUnchecks} {t('unchecks')}, {s.filterHovers} {t('hovers')} ({fmtDuration(s.filterHoverMs)}), {s.filterClears} {t('clears')},{' '}
            {s.filterResets} {t('resets')} · {t('Scrolling')}: {t('filters')} {fmtDuration(s.scrollFiltersMs)}, {t('library')} {fmtDuration(s.scrollLibraryMs)} · {t('Assistant')}:{' '}
            {s.assistantTurns} {t('turns')}, {t('typing')} {fmtDuration(s.assistantTypingMs)}, {t('waiting')} {fmtDuration(s.assistantWaitMs)}
            {s.assistantFinalFilters ? ` · ${t('final tags')}: ${Object.values(s.assistantFinalFilters).flat().join(', ')}` : ''}
          </Typography>
        )}

        {state.error && <Alert severity='error'>{state.error}</Alert>}
        {state.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {transcript.length > 0 && (
              <>
                <Typography variant='subtitle2' sx={{ fontWeight: 800, mb: 1 }}>
                  {t('Assistant transcript')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 2.5 }}>
                  {transcript.map(e => (
                    <Box
                      key={e.seq}
                      sx={{
                        alignSelf: e.type === 'assistant_message' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 2,
                        bgcolor: e.type === 'assistant_message' ? 'primary.main' : 'grey.100',
                        color: e.type === 'assistant_message' ? 'common.white' : 'text.primary'
                      }}
                    >
                      <Typography variant='caption' sx={{ opacity: 0.75 }}>
                        {fmtDuration(e.elapsedMs)} · {describe(e)}
                      </Typography>
                      <Typography variant='body2' sx={{ whiteSpace: 'pre-line' }}>
                        {e.data?.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 800, flex: 1 }}>
                {t('Timeline')} ({state.events.length})
              </Typography>
              <FormControlLabel control={<Switch size='small' checked={showScroll} onChange={e => setShowScroll(e.target.checked)} />} label={<Typography variant='body2'>{t('Show scrolling')}</Typography>} />
            </Box>
            <Table size='small'>
              <TableBody>
                {shown.map(e => (
                  <TableRow key={e.seq}>
                    <TableCell sx={{ width: 64, fontFamily: 'monospace', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>{fmtDuration(e.elapsedMs)}</TableCell>
                    <TableCell sx={{ width: 190, fontFamily: 'monospace', fontSize: 12.5 }}>{e.type}</TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{describe(e)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          {t('Close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
