import * as React from 'react';
import { Box, Button, Link, Typography } from '@mui/material';
import * as Icons from '@mui/icons-material';
import AssistantIcon from './AssistantIcon';

const STORAGE_KEY = 'mindapps-assistant-consent';

export const hasConsented = (): boolean => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false; // storage blocked → re-ask each session rather than assume consent
  }
};

export const recordConsent = () => {
  try {
    window.localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    /* storage blocked — they'll simply be asked again next time */
  }
};

/**
 * Shown before the first message can be sent. Anthropic is a third party and
 * the visitor's own words leave our infrastructure to reach it, so they are
 * told plainly before they type anything, not in a policy page they will never
 * open.
 *
 * Every claim here must stay true of the actual implementation:
 *  - the message text really is sent to Anthropic (cloud_functions/mind-search-assistant)
 *  - conversations really are not stored (we keep counts only: see metrics.js)
 *  - the id really is a random value we generate, NOT a device fingerprint
 *    (see clientId.ts). Do not describe it as "based on your browser".
 */
const POINTS = [
  {
    Icon: Icons.Send,
    text: (
      <>
        Your message goes to <strong>Claude</strong>, an AI service from Anthropic, which uses it to pick search filters.
      </>
    )
  },
  {
    Icon: Icons.VisibilityOff,
    text: (
      <>
        <strong>We don't save your conversations.</strong> We count how many messages people send, nothing more.
      </>
    )
  },
  {
    Icon: Icons.Shuffle,
    text: (
      <>
        A <strong>random ID</strong> is kept in this browser to prevent abuse. It says nothing about you, and clearing your browsing data erases it.
      </>
    )
  },
  {
    Icon: Icons.MedicalServices,
    text: (
      <>
        This is a search tool, not medical care. Please leave out personal health details. In a crisis, call or text{' '}
        <Link href='tel:988' underline='always'>
          988
        </Link>
        .
      </>
    )
  }
];

export default function ConsentNotice({ onAccept }: { onAccept: () => void }) {
  return (
    // Two-part column: the notice text scrolls if it must, the button is a
    // fixed footer that never scrolls out of view. (The earlier version put
    // the button in the scroll flow with mt:'auto', so a slightly-too-tall
    // notice pushed it past the bottom edge and clipped it.) minHeight:0 is
    // required for a flex child to actually be allowed to shrink and scroll.
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.dark' }}>
          <AssistantIcon size={28} />
          <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>Before you start</Typography>
        </Box>

        {POINTS.map(({ Icon, text }, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Icon sx={{ color: 'primary.main', fontSize: 16, mt: '2px', flexShrink: 0 }} />
            <Typography variant='body2' sx={{ fontSize: 12.5, lineHeight: 1.4 }}>
              {text}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ p: 1.5, pt: 1, flexShrink: 0, borderTop: '1px solid #E5EAF0', bgcolor: 'background.paper' }}>
        <Button fullWidth variant='contained' onClick={onAccept} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Got it, start chatting
        </Button>
      </Box>
    </Box>
  );
}
