/*
 * Interface language picker: a globe button showing the current language code
 * (EN / FR / DE) that opens a menu of languages, each named in itself.
 * `variant='list'` renders an inline list for the mobile navigation drawer.
 */
import * as React from 'react';
import { Box, Button, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { LANGUAGES, useLanguage, useT } from '.';

export default function LanguageSelector({ variant = 'button' }: { variant?: 'button' | 'list' }) {
  const [lang, setLang] = useLanguage();
  const t = useT();
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const current = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];

  if (variant === 'list')
    return (
      <Box>
        {LANGUAGES.map(l => (
          <ListItemButton key={l.code} selected={l.code === lang} onClick={() => setLang(l.code)} lang={l.code}>
            <ListItemIcon>{l.code === lang ? <Icons.Check /> : <Icons.Translate sx={{ opacity: 0 }} />}</ListItemIcon>
            <ListItemText primary={l.label} />
          </ListItemButton>
        ))}
      </Box>
    );

  return (
    <>
      <Button
        color='inherit'
        onClick={e => setAnchor(e.currentTarget)}
        aria-label={t('Language')}
        aria-haspopup='true'
        startIcon={<Icons.Language />}
        sx={{ textTransform: 'none', fontWeight: 700, minWidth: 0, px: 1 }}
      >
        {current.short}
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Typography variant='caption' color='text.secondary' sx={{ px: 2, display: 'block' }}>
          {t('Language')}
        </Typography>
        {LANGUAGES.map(l => (
          <MenuItem
            key={l.code}
            selected={l.code === lang}
            lang={l.code}
            onClick={() => {
              setLang(l.code);
              setAnchor(null);
            }}
          >
            <ListItemIcon>{l.code === lang && <Icons.Check fontSize='small' />}</ListItemIcon>
            {l.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
