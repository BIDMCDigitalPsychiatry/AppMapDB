/*
 * Public, shareable addresses for app pages: /apps/<name-slug>-<id>, plus /fr/… and /de/… for the
 * translated interface.
 *
 *   /apps/headspace-meditation-sleep-c8ffa1dd
 *
 * The 8-character id is the start of the app's groupId, which every rating/version of an app shares,
 * so the address never changes as new ratings are approved. The name part is only for people and
 * search engines: it is ignored when resolving, so a renamed app's old links still work (the page
 * then replaces the address with the current name). Collisions are checked when the pages are
 * generated; with ~1,300 ids ever created there are none at 8 characters.
 *
 * Kept free of React/browser imports: the static page generator uses the same functions, and the two
 * must agree exactly or generated pages would link to addresses the app can't resolve.
 */

export type Language = 'en' | 'fr' | 'de';

export const SHORT_ID_LENGTH = 8;
const MAX_SLUG_WORDS = 6;

const APP_PATH = /^\/(?:(fr|de)\/)?apps\/([a-z0-9-]+)\/?$/;
const TRAILING_ID = new RegExp(`(?:^|-)([0-9a-f]{${SHORT_ID_LENGTH}})$`);

export const appGroupId = (app: any): string => app?.groupId || app?._id || '';

export const shortAppId = (app: any): string => appGroupId(app).slice(0, SHORT_ID_LENGTH).toLowerCase();

// Same precedence as the library's getAppName: an explicit name, else the Google Play title, else the App Store title.
export const appDisplayName = (app: any): string => app?.name || app?.androidStore?.title || app?.appleStore?.title || '';

export const slugify = (text: string): string =>
  String(text ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // drop accents: "Cœur" → "Coeur", "Ánimo" → "Animo"
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .split('-')
    .filter(Boolean)
    .slice(0, MAX_SLUG_WORDS)
    .join('-');

export const appSlug = (app: any): string => {
  const id = shortAppId(app);
  const name = slugify(appDisplayName(app)) || 'app'; // e.g. a name written only in non-Latin script
  return `${name}-${id}`;
};

export const appPath = (app: any, lang: Language = 'en'): string => `${lang === 'en' ? '' : `/${lang}`}/apps/${appSlug(app)}`;

// Parses /apps/<slug>, /fr/apps/<slug> or /de/apps/<slug>. Returns null for anything else.
export const parseAppPath = (pathname: string): { lang: Language; slug: string; shortId: string } | null => {
  const match = APP_PATH.exec(String(pathname ?? '').toLowerCase());
  if (!match) return null;
  const [, lang, slug] = match;
  const id = TRAILING_ID.exec(slug);
  if (!id) return null;
  return { lang: (lang as Language) || 'en', slug, shortId: id[1] };
};

export const matchesShortId = (app: any, shortId: string): boolean => !!shortId && shortAppId(app) === shortId;
