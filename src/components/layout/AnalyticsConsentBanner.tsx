import * as React from 'react';
import { Box, Button, Paper, Portal, Typography } from '@mui/material';
import { useT } from '../../i18n';
import { getConsent, isAnalyticsActive, isEuropeanVisitor, OPEN_CONSENT_EVENT, setConsent } from '../../analytics/consent';

/**
 * Asks visitors in Europe whether analytics cookies may be used (see src/analytics/consent.ts).
 * Shown once, until they choose; the footer's "Cookie settings" link reopens it so the choice can be changed.
 *
 * Keep the wording true of index.html: Google Analytics is the only thing this controls, and nothing
 * is set until they accept.
 */
export default function AnalyticsConsentBanner() {
  const t = useT();
  const [open, setOpen] = React.useState(() => isAnalyticsActive() && isEuropeanVisitor() && getConsent() === null);

  React.useEffect(() => {
    const reopen = () => isAnalyticsActive() && setOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  if (!open) return null;

  const choose = (choice: 'granted' | 'denied') => () => {
    setConsent(choice);
    setOpen(false);
  };

  // Portaled and above modals so it can be answered even when the first-visit intro dialog is open.
  return (
    <Portal>
      <Paper
        role='region'
        aria-label={t('Cookie settings')}
        elevation={6}
        sx={{
          position: 'fixed',
          left: 16,
          right: 16,
          bottom: 16,
          mx: 'auto',
          maxWidth: 720,
          p: 2,
          zIndex: theme => theme.zIndex.modal + 1,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Typography variant='body2' sx={{ flex: '1 1 320px' }}>
          {t('MIND uses analytics cookies to understand how the site is used so we can improve it. They are only set if you accept.')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <Button variant='outlined' onClick={choose('denied')}>
            {t('Decline')}
          </Button>
          <Button variant='contained' onClick={choose('granted')}>
            {t('Accept')}
          </Button>
        </Box>
      </Paper>
    </Portal>
  );
}
