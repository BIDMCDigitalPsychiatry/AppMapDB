import * as React from 'react';
import { Box, CircularProgress, Fab, IconButton, Paper, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import * as Icons from '@mui/icons-material';
import AssistantIcon from './AssistantIcon';
import { useTableFilterValues } from '../../application/GenericTable/store';
import { useAssistantPanel } from '../../layout/store';
import { useAppBarHeight } from '../../layout/hooks';
import { useFullScreen } from '../../../hooks';
import { getAssistantClientId, newConversationId } from './clientId';
import ConsentNotice, { hasConsented, recordConsent } from './ConsentNotice';
import { ASSISTANT_ENDPOINT, assistantEnabled, MAX_HISTORY_TURNS, MAX_MESSAGE_CHARS, MAX_USER_TURNS } from './config';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME =
  "Hi! I can help you search the app library. Tell me what you're looking for — for example: “a free app for anxiety that works offline” — and I'll set the filters for you.";

const flattenFilters = (filters: Record<string, string[]> = {}) => Object.values(filters).reduce((acc, v) => acc.concat(v), [] as string[]);

/**
 * Search-assistant chat for the public app library page. Sends the visitor's
 * request to the mind-search-assistant backend, which returns
 * taxonomy-validated filters; those are dispatched into the same Redux
 * filter state the filter drawer writes to, so the drawer, counts and
 * results all update as if the user had clicked the checkboxes themselves.
 *
 * On desktop the panel DOCKS on the right: its open state lives in layout
 * state so Layout can reserve the width (mirroring the left filter drawer),
 * which reflows the grid rather than covering it. Below 'sm' it's a bottom
 * sheet instead, since there's no room to dock.
 *
 * Renders nothing when no endpoint is configured (production, before the
 * AWS wiring exists) — see ./config.ts.
 */
export default function SearchAssistant() {
  const [open, setOpen] = useAssistantPanel();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [consented, setConsented] = React.useState(hasConsented);
  // Groups the counts-only usage metrics into conversations. Reset by New chat.
  const conversationId = React.useRef(newConversationId());
  const [filterValues, setFilterValues] = useTableFilterValues('Applications');
  const [appBarHeight] = useAppBarHeight();
  const { layout } = useTheme() as any;
  const isMobile = useFullScreen('sm');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  // The panel's width is reserved by Layout, so leaving the page (or the
  // component unmounting for any reason) must release it or every other
  // page would keep an empty gutter on the right.
  React.useEffect(() => () => setOpen(false), []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!assistantEnabled) return null;

  const userTurns = messages.filter(m => m.role === 'user').length;
  const atTurnLimit = userTurns >= MAX_USER_TURNS;

  const send = async () => {
    const message = input.trim();
    if (!message || loading || atTurnLimit) return;
    setInput('');
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: message }];
    setMessages(nextMessages);
    setLoading(true);
    try {
      const history = nextMessages
        .slice(0, -1)
        .slice(-MAX_HISTORY_TURNS)
        .map(({ role, content }) => ({ role, content }));
      const res = await fetch(ASSISTANT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // currentFilters is the live drawer state (the user may have edited it
        // by hand), so the assistant can refine, remove from, or clear it.
        // clientId is a random per-browser pseudonym (see ./clientId.ts).
        body: JSON.stringify({
          message,
          history,
          currentFilters: filterValues,
          clientId: getAssistantClientId(),
          conversationId: conversationId.current
        })
      });
      const result = await res.json();
      if (result.type === 'filters') {
        // `apply` distinguishes "clear everything" (empty filters, apply=true)
        // from "that wasn't a search, leave the filters alone" (apply=false).
        if (result.apply) setFilterValues(result.filters || {});
        setMessages(prev => [...prev, { role: 'assistant', content: result.reply }]);
      } else {
        // 'crisis', 'bad_request' and 'error' all carry a displayable message
        setMessages(prev => [...prev, { role: 'assistant', content: result.reply || result.error || 'Something went wrong — please try again.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I couldn't reach the search assistant — please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {open && (
        <Paper
          elevation={isMobile ? 8 : 0}
          square={!isMobile}
          sx={{
            position: 'fixed',
            zIndex: 1200,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            ...(isMobile
              ? { left: 0, right: 0, bottom: 0, height: '70vh', borderRadius: '12px 12px 0 0' }
              : {
                  // Docked: sits in the gutter Layout reserves via marginRight,
                  // below the app bar, full height to the bottom of the viewport.
                  right: 0,
                  top: appBarHeight,
                  bottom: 0,
                  width: layout.assistantPanelWidth,
                  borderLeft: '1px solid #E5EAF0'
                })
          }}
        >
          <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'primary.dark', color: 'common.white' }}>
            <AssistantIcon size={26} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Search assistant</Typography>
              <Typography sx={{ fontSize: 12, opacity: 0.8, lineHeight: 1.2 }}>Finds filters, not medical advice</Typography>
            </Box>
            <Tooltip title='Start a new chat'>
              <span>
                <IconButton
                  size='small'
                  aria-label='Start a new chat'
                  disabled={messages.length === 0 || loading}
                  onClick={() => {
                    // A new chat starts from a clean search: the filters the
                    // old conversation applied go with it, so what's on screen
                    // always matches what was said.
                    setMessages([]);
                    setInput('');
                    setFilterValues({});
                    conversationId.current = newConversationId();
                  }}
                  sx={{ color: 'inherit', '&.Mui-disabled': { color: 'inherit', opacity: 0.35 } }}
                >
                  <Icons.RestartAlt fontSize='small' />
                </IconButton>
              </span>
            </Tooltip>
            <IconButton size='small' aria-label='Close assistant' onClick={() => setOpen(false)} sx={{ color: 'inherit' }}>
              <Icons.Close fontSize='small' />
            </IconButton>
          </Box>

          {/* Nothing can be typed or sent until the visitor has been told their
              words go to a third-party AI service. */}
          {!consented ? (
            // ConsentNotice owns its own scrolling (text scrolls, button stays
            // pinned), so this wrapper must not scroll too.
            <Box sx={{ flex: 1, minHeight: 0, bgcolor: '#F7F9FC' }}>
              <ConsentNotice
                onAccept={() => {
                  recordConsent();
                  setConsented(true);
                }}
              />
            </Box>
          ) : (
            <>
              <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.25, bgcolor: '#F7F9FC' }}>
                <AssistantBubble content={WELCOME} />
                {messages.map((m, i) => (m.role === 'user' ? <UserBubble key={i} content={m.content} /> : <AssistantBubble key={i} content={m.content} />))}
                {loading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 0.5 }}>
                    <CircularProgress size={14} thickness={5} />
                    <Typography variant='caption' color='textSecondary'>
                      Thinking…
                    </Typography>
                  </Box>
                )}
                {atTurnLimit && (
                  <Typography variant='caption' color='textSecondary' sx={{ textAlign: 'center', mt: 0.5 }}>
                    That's the limit for this visit — you can keep refining results with the filter panel.
                  </Typography>
                )}
              </Box>

              <Box sx={{ p: 1.25, display: 'flex', gap: 1, alignItems: 'flex-end', borderTop: '1px solid #E5EAF0', bgcolor: 'background.paper' }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  size='small'
                  placeholder='What kind of app are you looking for?'
                  value={input}
                  disabled={loading || atTurnLimit}
                  onChange={e => setInput(e.target.value.slice(0, MAX_MESSAGE_CHARS))}
                  onKeyDown={handleKeyDown}
                />
                <IconButton color='primary' aria-label='Send' disabled={!input.trim() || loading || atTurnLimit} onClick={send}>
                  <Icons.Send />
                </IconButton>
              </Box>

              {/* Standing reminder after consent, so the disclosure isn't a
                  one-time thing they clicked past and forgot. */}
              <Typography variant='caption' color='textSecondary' sx={{ px: 1.25, pb: 1, textAlign: 'center', fontSize: 10.5 }}>
                Messages are sent to Claude (Anthropic). Conversations aren't saved.
              </Typography>
            </>
          )}
        </Paper>
      )}

      {/* The launcher hides while the panel is docked — the panel has its own
          close button, and a floating button over the reflowed grid would be
          the very occlusion the docking is meant to avoid. */}
      {!open && (
        <Tooltip title='Ask the search assistant' placement='left'>
          <Fab color='primary' aria-label='Search assistant' onClick={() => setOpen(true)} sx={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1250 }}>
            <AssistantIcon size={32} />
          </Fab>
        </Tooltip>
      )}
    </>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <Box sx={{ alignSelf: 'flex-end', maxWidth: '85%', bgcolor: 'primary.main', color: 'common.white', borderRadius: '12px 12px 2px 12px', px: 1.5, py: 1 }}>
      <Typography variant='body2' sx={{ whiteSpace: 'pre-line' }}>
        {content}
      </Typography>
    </Box>
  );
}

function AssistantBubble({ content }: { content: string }) {
  return (
    <Box
      sx={{
        alignSelf: 'flex-start',
        maxWidth: '85%',
        bgcolor: 'background.paper',
        border: '1px solid #E5EAF0',
        borderRadius: '12px 12px 12px 2px',
        px: 1.5,
        py: 1
      }}
    >
      <Typography variant='body2' sx={{ whiteSpace: 'pre-line' }}>
        {content}
      </Typography>
    </Box>
  );
}
