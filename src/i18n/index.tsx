/*
 * Interface translation (English / French / German).
 *
 * Keys are the English text itself (gettext style): `t('Search by name')`.
 * - A missing translation falls back to the English, so untranslated
 *   strings never break the page.
 * - Reviewers and translators see the real English beside each translation.
 *
 * Usage:
 *   const t = useT();  t('Hello {{name}}', { name })      — in components
 *   tx('Is the app free?')                                 — marks a string in a module-level
 *                                                            constant for extraction; it is
 *                                                            translated where it's rendered,
 *                                                            usually by the shared field
 *                                                            components, which call t() on
 *                                                            string labels
 *   tc('verb', 'Archive')                                  — same English, different meaning:
 *                                                            the key becomes 'verb|Archive'
 *
 * Catalogs live in src/locales/{fr,de}.json and are lazy-loaded, so English
 * visitors download nothing extra. `npm run i18n:extract` regenerates
 * src/locales/source.json (every string + the files it appears in) and
 * reports missing translations. A test fails if fr/de miss any key.
 *
 * Stored data (app taxonomy values, saved filters, dialog ids) stays
 * English; only what's displayed is translated.
 */
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

export type Language = 'en' | 'fr' | 'de';

export const LANGUAGES: { code: Language; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'de', label: 'Deutsch', short: 'DE' }
];

const isLanguage = (v: any): v is Language => v === 'en' || v === 'fr' || v === 'de';

type Catalog = Record<string, string>;

const loaders: Record<Exclude<Language, 'en'>, () => Promise<{ default: Catalog }>> = {
  fr: () => import('../locales/fr.json'),
  de: () => import('../locales/de.json')
};

const loaded: Partial<Record<Language, Catalog>> = { en: {} };

// Marks a string for extraction without translating it (module-level constants).
export const tx = <T extends string>(text: T): T => text;

// Disambiguated key: same English, different meaning in another language.
export const tc = (context: string, text: string) => `${context}|${text}`;

const interpolate = (s: string, vars?: Record<string, any>) => (vars ? s.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => (vars[k] ?? '').toString()) : s);

// Plain-text fallback for a context key: 'verb|Archive' -> 'Archive'.
const stripContext = (key: string) => {
  const i = key.indexOf('|');
  return i > 0 && !key.slice(0, i).includes(' ') ? key.slice(i + 1) : key;
};

export const translate = (lang: Language, key: string, vars?: Record<string, any>) => interpolate(loaded[lang]?.[key] || stripContext(key), vars);

export type TFunction = (text: any, vars?: Record<string, any>) => any;

const I18nContext = React.createContext<{ lang: Language; t: TFunction }>({ lang: 'en', t: (text, vars) => (typeof text === 'string' ? translate('en', text, vars) : text) });

export const useLanguage = (): [Language, (lang: Language) => void] => {
  const dispatch = useDispatch();
  const stored = useSelector((s: any) => s.layout?.language);
  const lang = isLanguage(stored) ? stored : 'en';
  const setLang = React.useCallback((language: Language) => dispatch({ type: 'UPDATE_LAYOUT', payload: { language } }), [dispatch]);
  return [lang, setLang];
};

/*
 * Provides the active language + catalog. Also:
 *  - honors ?lang=fr|de|en in the URL (shareable translated links), and
 *  - keeps <html lang> in sync for screen readers and browser translation.
 */
export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useLanguage();
  const [, setVersion] = React.useState(0);

  React.useEffect(() => {
    try {
      const fromUrl = new URLSearchParams(window.location.search).get('lang');
      if (isLanguage(fromUrl) && fromUrl !== lang) setLang(fromUrl);
    } catch {
      // ignore malformed URLs
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = lang;
    if (lang !== 'en' && !loaded[lang]) {
      loaders[lang]()
        .then(m => {
          loaded[lang] = m.default;
          setVersion(v => v + 1);
        })
        .catch(err => console.error(`Failed to load ${lang} translations`, err));
    }
  }, [lang]);

  const catalog = loaded[lang];
  const value = React.useMemo(
    () => ({ lang, t: ((text, vars) => (typeof text === 'string' ? translate(lang, text, vars) : text)) as TFunction }),
    // re-create when the catalog finishes loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, catalog]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

// The translate function for the active language. Non-string values (React nodes) pass through unchanged.
export const useT = (): TFunction => React.useContext(I18nContext).t;

export const useCurrentLanguage = (): Language => React.useContext(I18nContext).lang;

// For class components / render props: <T>Some text</T>
export const T = ({ children, vars }: { children: string; vars?: Record<string, any> }) => <>{useT()(children, vars)}</>;
