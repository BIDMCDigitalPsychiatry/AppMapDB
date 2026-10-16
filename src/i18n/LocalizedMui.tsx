/*
 * Switches MUI's built-in text (table pagination, date pickers, …) and
 * date-fns formatting with the selected interface language.
 */
import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { frFR as muiFr, deDE as muiDe } from '@mui/material/locale';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { frFR as pickersFr, deDE as pickersDe } from '@mui/x-date-pickers/locales';
import fr from 'date-fns/locale/fr';
import de from 'date-fns/locale/de';
import { useCurrentLanguage } from '.';

const MUI = { fr: muiFr, de: muiDe };
const PICKERS = { fr: pickersFr, de: pickersDe };
const DATE_FNS = { fr, de };

export const LocalizedDatePickers = ({ children }: { children: React.ReactNode }) => {
  const lang = useCurrentLanguage();
  return (
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      adapterLocale={lang === 'en' ? undefined : DATE_FNS[lang]}
      localeText={lang === 'en' ? undefined : PICKERS[lang].components.MuiLocalizationProvider.defaultProps.localeText}
    >
      {children}
    </LocalizationProvider>
  );
};

// Layers MUI component text (e.g. "Rows per page") onto the surrounding theme.
export const LocalizedTheme = ({ children }: { children: React.ReactNode }) => {
  const lang = useCurrentLanguage();
  // Always render the same ThemeProvider: switching between a bare fragment (English) and a provider
  // changed the tree's shape, which remounted the whole app on every language change (re-opening the
  // first-visit PWA notice and losing scroll/panel state).
  const theme = React.useCallback(outer => (lang === 'en' ? outer : createTheme(outer, MUI[lang])), [lang]);
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

// Locale-aware date formatting for display (Intl): formatDate(ms, lang)
export const formatDate = (value: number | Date | undefined, lang: string, options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }) =>
  value ? new Date(value).toLocaleDateString(lang === 'en' ? undefined : lang, options) : '';
