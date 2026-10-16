/*
 * Admin > App Submissions (Submission Reviewers + Super Admins — gated in
 * Admin.tsx/AdminLayoutSelector and enforced server-side by the write API).
 * Lists submissions from the public "Submit an App" form; a reviewer opens
 * one, checks it, and either creates a pre-filled app rating from it or
 * declines / marks it a duplicate. Every status change can carry a note,
 * kept as a history on the submission.
 */
import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import * as Icons from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { AppSubmission, listSubmissions, SubmissionStatus, SUBMISSION_STATUS_LABELS, updateSubmission } from '../../../database/appSubmissions';
import { isNoCurrentUserError, sessionExpired, SESSION_EXPIRED_MESSAGE } from '../../../database/session';
import { useApplications } from '../../../database/useApplications';
import { getAndroidIdFromUrl, getAppleIdFromUrl, isEmpty, publicUrl } from '../../../helpers';
import { useHeaderHeightSetRef, useHandleChangeRoute } from '../../layout/hooks';
import { useDialogState } from '../../application/GenericDialog/useDialogState';
import RateNewAppDialog from '../../application/GenericDialog/RateNewApp/RateNewAppDialog';
import { updateSnackBar } from '../../application/SnackBar/store';
import { SubmissionSummary } from '../SubmitApp/steps';
import { toRatingValues, unsureAnswers } from '../SubmitApp/form';

const RATING_DIALOG_ID = 'Create Rating From Submission';

const STATUS_COLORS: Record<SubmissionStatus, 'info' | 'warning' | 'success' | 'default' | 'secondary'> = {
  new: 'info',
  inreview: 'warning',
  converted: 'success',
  declined: 'default',
  duplicate: 'secondary'
};

type Filter = 'open' | 'converted' | 'closed' | 'all';
const FILTERS: { value: Filter; label: string; match: (s: SubmissionStatus) => boolean }[] = [
  { value: 'open', label: 'Open', match: s => s === 'new' || s === 'inreview' },
  { value: 'converted', label: 'Rating created', match: s => s === 'converted' },
  { value: 'closed', label: 'Declined / duplicate', match: s => s === 'declined' || s === 'duplicate' },
  { value: 'all', label: 'All', match: () => true }
];

const formatDate = (ms?: number) => (ms ? new Date(ms).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '');

export const StatusChip = ({ status }: { status: SubmissionStatus }) => (
  <Chip size='small' color={STATUS_COLORS[status] as any} label={SUBMISSION_STATUS_LABELS[status] ?? status} sx={{ fontWeight: 600 }} />
);

// Library apps that share a store id or link with the submission.
const useDuplicates = (s?: AppSubmission) => {
  const [apps] = useApplications();
  return React.useMemo(() => {
    if (!s) return [];
    const iosId = getAppleIdFromUrl(s.app?.iosLink ?? '');
    const androidId = getAndroidIdFromUrl(s.app?.androidLink ?? '');
    const web = (s.app?.webLink ?? '').toLowerCase().replace(/\/+$/, '');
    const seen = new Map<string, any>();
    Object.values(apps ?? {}).forEach((a: any) => {
      if (!a || a.delete === true) return;
      const match =
        (!isEmpty(iosId) && (a.appleStore?.appId === iosId || getAppleIdFromUrl(a.iosLink ?? '') === iosId)) ||
        (!isEmpty(androidId) && (a.androidStore?.appId === androidId || getAndroidIdFromUrl(a.androidLink ?? '') === androidId)) ||
        (!isEmpty(web) && (a.webLink ?? '').toLowerCase().replace(/\/+$/, '') === web);
      if (match) seen.set(a.groupId ?? a._id, a);
    });
    return Array.from(seen.values());
  }, [apps, s]);
};

const SubmissionDetail = ({
  submission,
  onClose,
  onUpdate,
  onCreateRating
}: {
  submission: AppSubmission;
  onClose: () => void;
  onUpdate: (data: { status?: SubmissionStatus; note?: string }) => Promise<boolean>;
  onCreateRating: () => void;
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [note, setNote] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const duplicates = useDuplicates(submission);
  const unsure = unsureAnswers(submission);
  const changeRoute = useHandleChangeRoute();
  const s = submission;

  const act = (status?: SubmissionStatus) => async () => {
    setBusy(true);
    const ok = await onUpdate({ status, note: note.trim() || undefined });
    setBusy(false);
    if (ok) setNote('');
  };

  return (
    <Dialog open onClose={onClose} fullScreen={fullScreen} maxWidth='md' fullWidth PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, pr: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant='h5' sx={{ fontWeight: 800 }} noWrap>
            {s.app?.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
            <StatusChip status={s.status} />
            <Typography variant='body2' color='text.secondary'>
              Submitted {formatDate(s.created)} by {s.submitter?.firstName} {s.submitter?.lastName} ·{' '}
              <Link href={`mailto:${s.submitter?.email}`}>{s.submitter?.email}</Link>
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} aria-label='Close'>
          <Icons.Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {duplicates.length > 0 && (
          <Alert severity='warning' sx={{ mb: 2 }}>
            <b>This app may already be in the library:</b>{' '}
            {duplicates.map((a, i) => (
              <React.Fragment key={a._id}>
                {i > 0 && ', '}
                <Link component='button' onClick={changeRoute(publicUrl('/ViewApp'), { app: a, from: 'Admin' })} sx={{ verticalAlign: 'baseline' }}>
                  {a.name}
                </Link>
                {a.approved !== true && ' (pending approval)'}
              </React.Fragment>
            ))}
            . Consider “Mark duplicate”, or rate the existing app instead.
          </Alert>
        )}
        {unsure.length > 0 && (
          <Alert severity='info' sx={{ mb: 2 }}>
            <b>The submitter wasn’t sure about {unsure.length === 1 ? 'one question' : `${unsure.length} questions`}</b> — these are pre-filled as “No” in the
            rating, so please check them:
            <Box component='ul' sx={{ m: 0, mt: 0.5, pl: 2.5 }}>
              {unsure.map(u => (
                <li key={`${u.field}.${u.value}`}>{u.label}</li>
              ))}
            </Box>
          </Alert>
        )}

        {s.ratingId && (
          <Alert severity='success' sx={{ mb: 2 }}>
            A rating was created from this suggestion. It is in <b>Admin → Pending Approvals</b> until an admin approves it.
          </Alert>
        )}

        <Box sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'action.hover' }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Review actions</Typography>
          <TextField
            fullWidth
            size='small'
            multiline
            minRows={2}
            placeholder='Optional note (saved with the status change — e.g. why it was declined)'
            value={note}
            onChange={e => setNote(e.target.value)}
            sx={{ bgcolor: 'background.paper' }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
            <Button variant='contained' startIcon={<Icons.RateReview />} disabled={busy} onClick={onCreateRating} sx={{ textTransform: 'none', fontWeight: 700 }}>
              {s.ratingId ? 'Create another rating' : 'Create rating'}
            </Button>
            {s.status !== 'inreview' && (
              <Button variant='outlined' disabled={busy} onClick={act('inreview')} sx={{ textTransform: 'none' }}>
                Mark in review
              </Button>
            )}
            {s.status !== 'duplicate' && (
              <Button variant='outlined' disabled={busy} onClick={act('duplicate')} sx={{ textTransform: 'none' }}>
                Mark duplicate
              </Button>
            )}
            {s.status !== 'declined' && (
              <Button variant='outlined' color='error' disabled={busy} onClick={act('declined')} sx={{ textTransform: 'none' }}>
                Decline
              </Button>
            )}
            {(s.status === 'declined' || s.status === 'duplicate') && (
              <Button variant='text' disabled={busy} onClick={act('new')} sx={{ textTransform: 'none' }}>
                Reopen
              </Button>
            )}
            <Button variant='text' disabled={busy || !note.trim()} onClick={act(undefined)} sx={{ textTransform: 'none', ml: 'auto' }}>
              Add note only
            </Button>
          </Box>
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
            “Create rating” opens the rating form pre-filled with these answers. Saving it marks this suggestion “Rating created”; the rating then goes through
            the usual approval.
          </Typography>
        </Box>

        {(s.notes ?? []).length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 700, color: 'primary.dark', mb: 0.5 }}>Review history</Typography>
            {(s.notes ?? [])
              .slice()
              .reverse()
              .map((n, i) => (
                <Box key={i} sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant='body2' color='text.secondary'>
                    {formatDate(n.at)} · {n.by}
                    {n.status && <> · marked {SUBMISSION_STATUS_LABELS[n.status]}</>}
                  </Typography>
                  <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
                    {n.text}
                  </Typography>
                </Box>
              ))}
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />
        <SubmissionSummary form={s} />
      </DialogContent>
    </Dialog>
  );
};

export default function AppSubmissions({ height = undefined as number | undefined }) {
  const dispatch = useDispatch();
  const headerRef = useHeaderHeightSetRef();
  const [state, setState] = React.useState({ loading: true, error: '', rows: [] as AppSubmission[] });
  const [filter, setFilter] = React.useState<Filter>('open');
  const [selectedId, setSelectedId] = React.useState<string | undefined>();
  const [, setRatingDialog] = useDialogState(RATING_DIALOG_ID);
  const convertingRef = React.useRef<string | undefined>();

  const handleError = React.useCallback(
    (err: any) => {
      if (isNoCurrentUserError(err)) dispatch(sessionExpired() as any);
      return isNoCurrentUserError(err) ? SESSION_EXPIRED_MESSAGE : String(err?.message ?? err);
    },
    [dispatch]
  );

  const load = React.useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: '' }));
    listSubmissions()
      .then(rows => setState({ loading: false, error: '', rows }))
      .catch(err => setState(prev => ({ ...prev, loading: false, error: handleError(err) })));
  }, [handleError]);

  React.useEffect(load, [load]);

  const replaceRow = (row: AppSubmission) => setState(prev => ({ ...prev, rows: prev.rows.map(r => (r._id === row._id ? row : r)) }));

  const update = React.useCallback(
    async (_id: string, data: { status?: SubmissionStatus; note?: string; ratingId?: string }) => {
      try {
        replaceRow(await updateSubmission({ _id, ...data }));
        dispatch(updateSnackBar({ open: true, variant: 'success', message: 'Suggestion updated' }));
        return true;
      } catch (err) {
        dispatch(updateSnackBar({ open: true, variant: 'error', message: handleError(err) }));
        return false;
      }
    },
    [dispatch, handleError]
  );

  const selected = state.rows.find(r => r._id === selectedId);

  const handleCreateRating = () => {
    if (!selected) return;
    convertingRef.current = selected._id;
    setSelectedId(undefined);
    setRatingDialog({ open: true, type: 'Add', initialValues: toRatingValues(selected), errors: {}, showErrors: false, submitting: false, loading: false });
    if (selected.status === 'new') update(selected._id, { status: 'inreview' });
  };

  const handleRatingSaved = React.useCallback(
    (application: any) => {
      const submissionId = convertingRef.current;
      convertingRef.current = undefined;
      if (submissionId && application?._id) update(submissionId, { status: 'converted', ratingId: application._id, note: `Rating created: ${application.name ?? ''}`.trim() });
    },
    [update]
  );

  const counts = React.useMemo(() => Object.fromEntries(FILTERS.map(f => [f.value, state.rows.filter(r => f.match(r.status)).length])), [state.rows]);
  const rows = state.rows.filter(r => FILTERS.find(f => f.value === filter)!.match(r.status));

  return (
    <>
      <Box ref={headerRef} sx={{ bgcolor: 'primary.light', px: { xs: 2, md: 4 }, py: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 240 }}>
          <Typography sx={{ fontSize: 30, lineHeight: 1.2, fontWeight: 900, color: 'primary.dark' }}>App Suggestions</Typography>
          <Typography variant='body2' color='text.secondary'>
            Apps suggested through the public “Suggest an App” form. Visible to Submission Reviewers and Super Admins.
          </Typography>
        </Box>
        <ToggleButtonGroup exclusive size='small' value={filter} onChange={(_, v) => v && setFilter(v)} sx={{ bgcolor: 'background.paper' }}>
          {FILTERS.map(f => (
            <ToggleButton key={f.value} value={f.value} sx={{ textTransform: 'none', px: 1.5 }}>
              {f.label} ({counts[f.value] ?? 0})
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Tooltip title='Refresh'>
          <span>
            <IconButton onClick={load} disabled={state.loading} sx={{ bgcolor: 'background.paper' }}>
              <Icons.Refresh />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box sx={{ bgcolor: 'background.paper', height, overflow: 'auto' }}>
        {state.error ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color='error' sx={{ mb: 2 }}>
              {state.error}
            </Typography>
            <Button variant='outlined' onClick={load} sx={{ textTransform: 'none' }}>
              Retry
            </Button>
          </Box>
        ) : state.loading && state.rows.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : rows.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Icons.Inbox sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography color='text.secondary'>No suggestions here.</Typography>
          </Box>
        ) : (
          <Table stickyHeader size='small'>
            <TableHead>
              <TableRow>
                <TableCell>App</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Submitted by</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r._id} hover onClick={() => setSelectedId(r._id)} sx={{ cursor: 'pointer' }}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>{r.app?.name}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {[r.app?.iosLink && 'iOS', r.app?.androidLink && 'Android', r.app?.webLink && 'Web'].filter(Boolean).join(' · ')}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant='body2'>
                      {r.submitter?.firstName} {r.submitter?.lastName}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {r.submitter?.organization} · {r.submitter?.relationship === 'developer' ? 'App team' : 'Recommender'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, whiteSpace: 'nowrap' }}>{formatDate(r.created)}</TableCell>
                  <TableCell>
                    <StatusChip status={r.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>

      {selected && <SubmissionDetail submission={selected} onClose={() => setSelectedId(undefined)} onUpdate={data => update(selected._id, data)} onCreateRating={handleCreateRating} />}
      <RateNewAppDialog id={RATING_DIALOG_ID} isAdminEdit={false} onSaved={handleRatingSaved} successRoute={null} onClose={() => (convertingRef.current = undefined)} />
    </>
  );
}
