/*
 * Static pages for search engines and AI tools, written into build/ after `vite build` (run by
 * scripts/seo/run.mjs, which loads this file through Vite so it can share the app's TypeScript).
 *
 * GitHub Pages serves build/apps/<slug>.html at /apps/<slug> with a 200 status, so each approved app gets
 * a real page in English, French and German. Each page carries the app's name, MIND's evaluation and the
 * store description as plain HTML, plus the app's record as JSON, so the site renders it immediately when
 * it loads on top (src/components/pages/ViewApp.tsx). Addresses without a file still fall back to
 * 404.html (the plain app), which looks the app up, so apps approved since the last build still work.
 *
 * Also written: the library pages (/, /Apps, /fr/Apps, /de/Apps) listing every app with a link,
 * head-only pages for the other public sections, sitemap.xml (with last-modified dates and language
 * alternates) and llms.txt.
 *
 * Every page is regenerated on every build: it takes well under a second, and pages carried over from an
 * older build would reference that build's script files, which no longer exist.
 *
 * Failure policy: in CI (GitHub Actions) any problem fails the build, so a deploy never ships with app
 * pages missing; locally it only warns, so offline builds still work.
 */
import fs from 'fs';
import path from 'path';
import { dynamo, tables, indexes } from '../../src/database/dbConfig';
import { getAppCountries, withReplacement } from '../../src/database/models/Application';
import { appDisplayName, appGroupId, appPath, shortAppId, type Language } from '../../src/appUrl';
import { evaluationFields, SITE_NAME, SITE_URL, text } from '../../src/seo/pageText';

const BUILD = path.resolve('build');
const LANGUAGES: Language[] = ['en', 'fr', 'de'];
const LOCALE: Record<Language, string> = { en: 'en-US', fr: 'fr-FR', de: 'de-DE' };
const MIN_EXPECTED_APPS = 100; // fewer means a partial or failed read: refuse to publish a gutted site
const PRIVATE_FIELDS = ['email', 'approverEmail', 'uid']; // never embedded in public HTML

const strict = process.env.GITHUB_ACTIONS === 'true' || process.env.CI === 'true';

/* --------------------------------------------------------------- translation (same rules as src/i18n) */

const catalogs: Record<Language, Record<string, string>> = {
  en: {},
  fr: JSON.parse(fs.readFileSync(path.resolve('src/locales/fr.json'), 'utf8')),
  de: JSON.parse(fs.readFileSync(path.resolve('src/locales/de.json'), 'utf8'))
};
const stripContext = (key: string) => {
  const i = key.indexOf('|');
  return i > 0 && !key.slice(0, i).includes(' ') ? key.slice(i + 1) : key;
};
const interpolate = (s: string, vars: Record<string, any> = {}) => s.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
const tr = (lang: Language, key: string, vars?: Record<string, any>) => interpolate(catalogs[lang][key] || stripContext(key), vars);

/* --------------------------------------------------------------------------------------------- data */

const fetchApprovedApps = async (): Promise<any[]> => {
  const rows: any[] = [];
  const params: any = {
    TableName: tables.applications,
    IndexName: indexes.current,
    KeyConditionExpression: '#c = :v',
    ExpressionAttributeNames: { '#c': 'cur' },
    ExpressionAttributeValues: { ':v': 'approved' },
    ExclusiveStartKey: undefined
  };
  let page;
  do {
    page = await dynamo.query(params).promise();
    rows.push(...(page.Items ?? []));
    params.ExclusiveStartKey = page.LastEvaluatedKey;
  } while (page.LastEvaluatedKey);

  // One record per app. Normally the current-index already guarantees that; if the cur flags ever drift
  // (two approved rows in one group), keep the newest, as the library does.
  const byGroup = new Map<string, any>();
  for (const r of rows) {
    if (r.draft === true || r.delete === true || r.approved !== true) continue;
    const g = appGroupId(r);
    const prev = byGroup.get(g);
    if (!prev || (r.updated ?? 0) > (prev.updated ?? 0)) byGroup.set(g, r);
  }
  return Array.from(byGroup.values()).sort((a, b) => appPath(a).localeCompare(appPath(b)));
};

/* ------------------------------------------------------------------------------------------ helpers */

const esc = (s: any) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// JSON inside <script>: escape "<" so a "</script>" in any text field can't end the element.
const jsonForScript = (value: any) => JSON.stringify(value).replace(/</g, '\\u003c');

const plainText = (html: string) =>
  String(html ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const truncate = (s: string, max: number) => (s.length <= max ? s : s.slice(0, s.lastIndexOf(' ', max) > max * 0.6 ? s.lastIndexOf(' ', max) : max).trimEnd() + '…');

const paragraphs = (s: string) =>
  s
    .split(/\n+/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${esc(p)}</p>`)
    .join('');

const formatDate = (lang: Language, ms: number) =>
  ms ? new Intl.DateTimeFormat(LOCALE[lang], { dateStyle: 'long', timeZone: 'America/New_York' }).format(new Date(ms)) : '';
const isoDate = (ms: number) => (ms ? new Date(ms).toISOString().slice(0, 10) : '');

const appIcon = (app: any) => app.icon || app.appleStore?.icon || app.androidStore?.icon || '';
const storeDescription = (app: any) => plainText(app.appleStore?.description || app.androidStore?.description || '');
const company = (app: any) => app.company || app.androidStore?.developer || app.appleStore?.developer || '';

const fieldValues = (app: any, field: string): string[] => {
  const raw = field === 'countries' ? getAppCountries(app) : Array.isArray(app[field]) ? app[field] : [];
  return raw.map((v: string) => (field === 'costs' ? withReplacement(v) : v));
};

const localizedLibraryPath = (lang: Language) => (lang === 'en' ? '/' : `/${lang}/Apps`);

/* --------------------------------------------------------------------------------------------- head */

interface Head {
  lang: Language;
  title: string;
  description: string;
  canonical?: string; // site-relative path
  alternates?: Partial<Record<Language, string>>; // site-relative paths of the same page in each language
  image?: string;
  jsonLd?: any[];
}

const renderHead = ({ title, description, canonical, alternates, image, jsonLd = [] }: Head) => {
  const lines = [`<title>${esc(title)}</title>`, `<meta name="description" content="${esc(description)}" />`];
  if (canonical) lines.push(`<link rel="canonical" href="${SITE_URL}${canonical}" />`);
  if (alternates) {
    for (const l of LANGUAGES) if (alternates[l]) lines.push(`<link rel="alternate" hreflang="${l}" href="${SITE_URL}${alternates[l]}" />`);
    if (alternates.en) lines.push(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}${alternates.en}" />`);
  }
  lines.push(
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`
  );
  if (canonical) lines.push(`<meta property="og:url" content="${SITE_URL}${canonical}" />`);
  if (image) {
    lines.push(`<meta property="og:image" content="${esc(image)}" />`, `<meta name="twitter:card" content="summary" />`);
  } else {
    lines.push(
      `<meta property="og:image" content="${SITE_URL}/og-image.png" />`,
      `<meta property="og:image:width" content="1200" />`,
      `<meta property="og:image:height" content="630" />`,
      `<meta name="twitter:card" content="summary_large_image" />`
    );
  }
  for (const data of jsonLd) lines.push(`<script type="application/ld+json">${jsonForScript(data)}</script>`);
  return lines.map(l => `    ${l}`).join('\n');
};

// Minimal styling for the moment before the app replaces this content (and for readers without JS).
const STATIC_STYLE =
  '<style>.seo-static{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;max-width:860px;margin:0 auto;padding:24px 16px;line-height:1.5;color:#1d2433}.seo-static img{border-radius:16px}.seo-static dt{font-weight:600;margin-top:8px}.seo-static dd{margin:0}</style>';

const SEO_REGION = /<!-- seo:start[\s\S]*?<!-- seo:end -->/;

const renderPage = (template: string, head: Head, body = '', data?: any) => {
  if (!SEO_REGION.test(template)) throw new Error('index.html is missing the <!-- seo:start --> … <!-- seo:end --> markers');
  const root = body ? `<div id="root">${STATIC_STYLE}<main class="seo-static">${body}</main></div>` : '<div id="root"></div>';
  const dataScript = data ? `\n    <script type="application/json" id="mind-app-data">${jsonForScript(data)}</script>` : '';
  return template
    .replace(/<html lang="[^"]*">/, `<html lang="${head.lang}">`)
    .replace(SEO_REGION, renderHead(head).trimStart())
    .replace('<div id="root"></div>', root + dataScript);
};

/* ------------------------------------------------------------------------------------------- pages */

const renderAppBody = (app: any, lang: Language) => {
  const name = appDisplayName(app);
  const by = company(app);
  const icon = appIcon(app);
  const t = (k: string, v?: any) => tr(lang, k, v);

  const details = evaluationFields
    .map(({ field, heading }) => {
      const values = fieldValues(app, field);
      if (field === 'costs' && values.length === 0) values.push(text.unknownCost);
      return values.length ? `<dt>${esc(t(heading))}</dt><dd>${esc(values.map(v => t(v)).join(', '))}</dd>` : '';
    })
    .join('');

  const links = [
    app.iosLink && `<li><a href="${esc(app.iosLink)}" rel="nofollow">${esc(t(text.appStore))}</a></li>`,
    app.androidLink && `<li><a href="${esc(app.androidLink)}" rel="nofollow">${esc(t(text.googlePlay))}</a></li>`,
    app.webLink && `<li><a href="${esc(app.webLink)}" rel="nofollow">${esc(t(text.website))}</a></li>`
  ].filter(Boolean);

  const description = storeDescription(app);
  const review = plainText(app.review ?? '');

  return [
    `<nav><a href="${localizedLibraryPath(lang)}">${esc(t(text.backToLibrary))}</a></nav>`,
    `<header>`,
    icon ? `<img src="${esc(icon)}" alt="" width="96" height="96" />` : '',
    `<h1>${esc(name)}</h1>`,
    by ? `<p>${esc(t(text.by, { company: by }))}</p>` : '',
    `</header>`,
    `<section><h2>${esc(t(text.evaluationHeading))}</h2><dl>${details}</dl>`,
    app.updated ? `<p>${esc(t(text.lastReviewed, { date: formatDate(lang, app.updated) }))}</p>` : '',
    `<p><a href="/FrameworkQuestions">${esc(t(text.aboutFramework))}</a></p></section>`,
    review ? `<section><h2>${esc(t(text.reviewHeading))}</h2><p><em>${esc(t(text.reviewNote))}</em></p>${paragraphs(review)}</section>` : '',
    description
      ? `<section><h2>${esc(t(text.storeDescriptionHeading))}</h2><p><em>${esc(t(text.storeDescriptionNote))}</em></p>${paragraphs(truncate(description, 1500))}</section>`
      : '',
    links.length ? `<section><h2>${esc(t(text.getTheApp))}</h2><ul>${links.join('')}</ul></section>` : ''
  ].join('');
};

const appJsonLd = (app: any, lang: Language, description: string) => {
  const by = company(app);
  const platforms = fieldValues(app, 'platforms');
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: appDisplayName(app),
    url: `${SITE_URL}${appPath(app, lang)}`,
    description,
    applicationCategory: 'HealthApplication',
    ...(platforms.length ? { operatingSystem: platforms.join(', ') } : {}),
    ...(appIcon(app) ? { image: appIcon(app) } : {}),
    ...(by ? { author: { '@type': 'Organization', name: by } } : {}),
    ...(app.updated ? { dateModified: isoDate(app.updated) } : {}),
    inLanguage: lang
  };
};

const publicRecord = (app: any) => {
  const copy = { ...app };
  for (const f of PRIVATE_FIELDS) delete copy[f];
  return copy;
};

const renderLibraryBody = (apps: any[], lang: Language) => {
  const t = (k: string, v?: any) => tr(lang, k, v);
  const items = apps
    .map(app => {
      const costs = fieldValues(app, 'costs').map(v => t(v));
      const conditions = fieldValues(app, 'conditions').slice(0, 4).map(v => t(v));
      const summary = [costs.join(', '), conditions.join(', ')].filter(Boolean).join(' · ');
      return `<li><a href="${appPath(app, lang)}">${esc(appDisplayName(app))}</a>${summary ? ` — ${esc(summary)}` : ''}</li>`;
    })
    .join('');
  return [
    `<h1>${esc(t(text.libraryHeading))}</h1>`,
    `<p>${esc(t(text.libraryIntro))}</p>`,
    `<p><a href="/FrameworkQuestions">${esc(t(text.aboutFramework))}</a></p>`,
    `<h2>${esc(t(text.allApps, { count: apps.length }))}</h2>`,
    `<ul>${items}</ul>`
  ].join('');
};

/* ------------------------------------------------------------------------------- sitemap, llms.txt */

const sitemapEntry = (loc: string, lastmod: string, alternates?: Partial<Record<Language, string>>) => {
  const alt = alternates
    ? [
        ...LANGUAGES.filter(l => alternates[l]).map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL}${alternates[l]}"/>`),
        alternates.en ? `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${alternates.en}"/>` : ''
      ].join('')
    : '';
  return `<url><loc>${SITE_URL}${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}${alt}</url>`;
};

const renderLlmsTxt = (apps: any[]) => {
  const lines = [
    '# MIND (M-Health Index and Navigation Database)',
    '',
    `> ${text.libraryIntro}`,
    '',
    'Each app page lists MIND’s evaluation (cost, platforms, supported conditions, privacy, clinical foundation, features, engagement, inputs and outputs, developer type, country availability), the date it was last reviewed, and the rater’s qualitative review when there is one. Store descriptions are quoted from the app stores and are not vetted by MIND. MIND does not endorse apps; ratings describe what each app offers so people and clinicians can choose for themselves.',
    '',
    'Pages are also available in French (/fr/…) and German (/de/…).',
    '',
    '## Key pages',
    '',
    `- [App library](${SITE_URL}/): every evaluated app, searchable and filterable`,
    `- [Evaluation framework](${SITE_URL}/FrameworkQuestions): the questions raters answer for each app`,
    `- [Suggest an app](${SITE_URL}/SuggestApp): suggest an app for evaluation`,
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    '',
    `## Evaluated apps (${apps.length})`,
    ''
  ];
  for (const app of apps) {
    const costs = fieldValues(app, 'costs').join(', ');
    const conditions = fieldValues(app, 'conditions').slice(0, 5).join(', ');
    const summary = [costs, conditions && `conditions: ${conditions}`].filter(Boolean).join('; ');
    lines.push(`- [${appDisplayName(app).replace(/[[\]]/g, '')}](${SITE_URL}${appPath(app)})${summary ? `: ${summary}` : ''}`);
  }
  return lines.join('\n') + '\n';
};

/* --------------------------------------------------------------------------------------------- main */

const write = (relative: string, content: string) => {
  const file = path.join(BUILD, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

export async function generate() {
  const started = Date.now();
  const templatePath = path.join(BUILD, 'index.html');
  if (!fs.existsSync(templatePath)) throw new Error('build/index.html not found: run `vite build` first');
  const template = fs.readFileSync(templatePath, 'utf8');

  let apps: any[];
  try {
    apps = await fetchApprovedApps();
    if (apps.length < MIN_EXPECTED_APPS) throw new Error(`only ${apps.length} approved apps returned (expected at least ${MIN_EXPECTED_APPS})`);
  } catch (err) {
    if (strict) throw err;
    console.warn(`[seo] Skipping static pages: could not read the app list (${(err as Error).message}).`);
    return;
  }

  const seen = new Map<string, string>();
  for (const app of apps) {
    const id = shortAppId(app);
    const other = seen.get(id);
    if (other && other !== appGroupId(app)) throw new Error(`[seo] Two apps share the address id ${id}; increase SHORT_ID_LENGTH in src/appUrl.ts`);
    seen.set(id, appGroupId(app));
  }

  const sitemap: string[] = [];
  const newest = Math.max(...apps.map(a => a.updated ?? 0));

  // Library: / (English, canonical), /Apps (same page; canonical points to /), /fr/Apps, /de/Apps.
  const libraryAlternates = { en: '/', fr: '/fr/Apps', de: '/de/Apps' };
  for (const lang of LANGUAGES) {
    const head: Head = {
      lang,
      title: tr(lang, text.siteTitle),
      description: tr(lang, text.siteDescription, { count: Math.floor(apps.length / 50) * 50 }),
      canonical: libraryAlternates[lang],
      alternates: libraryAlternates,
      jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/`, inLanguage: lang }]
    };
    const html = renderPage(template, head, renderLibraryBody(apps, lang));
    if (lang === 'en') {
      write('index.html', html);
      write('Apps.html', html);
    } else {
      write(`${lang}/Apps.html`, html);
    }
    sitemap.push(sitemapEntry(libraryAlternates[lang], isoDate(newest), libraryAlternates));
  }

  // App pages.
  for (const app of apps) {
    const alternates = Object.fromEntries(LANGUAGES.map(l => [l, appPath(app, l)])) as Record<Language, string>;
    const record = publicRecord(app);
    for (const lang of LANGUAGES) {
      const name = appDisplayName(app);
      const description = tr(lang, text.appDescription, { name });
      const head: Head = {
        lang,
        title: tr(lang, text.appTitle, { name }),
        description,
        canonical: alternates[lang],
        alternates,
        image: appIcon(app) || undefined,
        jsonLd: [appJsonLd(app, lang, description)]
      };
      write(`${alternates[lang].slice(1)}.html`, renderPage(template, head, renderAppBody(app, lang), record));
      sitemap.push(sitemapEntry(alternates[lang], isoDate(app.updated), alternates));
    }
  }

  // Other public sections: English only, head only (the app renders the content). Mainly so they answer
  // with a 200 status and a proper title/description instead of falling back to 404.html.
  const sections = [
    { file: 'FrameworkQuestions', title: text.frameworkTitle, description: text.frameworkDescription },
    { file: 'Community', title: text.communityTitle, description: text.communityDescription },
    { file: 'SuggestApp', title: text.suggestTitle, description: text.suggestDescription }
  ];
  for (const s of sections) {
    write(`${s.file}.html`, renderPage(template, { lang: 'en', title: s.title, description: s.description, canonical: `/${s.file}` }));
    sitemap.push(sitemapEntry(`/${s.file}`, ''));
  }

  write(
    'sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sitemap.join('\n')}\n</urlset>\n`
  );
  write('llms.txt', renderLlmsTxt(apps));

  console.log(`[seo] ${apps.length} apps → ${apps.length * LANGUAGES.length} app pages, library, sitemap.xml, llms.txt in ${Date.now() - started} ms`);
}
