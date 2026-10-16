## Search engines, AI tools and analytics

The site is a single-page app on GitHub Pages, so on its own every address except `/` would answer
"404 Not Found" with an empty page. These pieces make the app library visible to Google and AI tools.

### App addresses
Every approved app has a permanent address: `/apps/<name>-<id>`, plus `/fr/apps/…` and `/de/apps/…`.
- The `<id>` is the first 8 characters of the app's `groupId`, which every rating of an app shares, so the
  address survives new ratings. The name part is ignored when resolving, so renamed apps' old links still
  work (the page then corrects the address).
- Format and parsing: `src/appUrl.ts` (shared by the site and the page generator; tests in `appUrl.test.ts`).
- Page: `AppPage` in `src/components/pages/ViewApp.tsx`. Cards open it through `useOpenApp()`
  (`src/components/layout/hooks.tsx`). Pending ratings in admin views still use the private `/ViewApp`.
- `/fr` and `/de` addresses set the interface language on arrival.

### Generated pages
`pnpm build` runs `scripts/seo/run.mjs` after `vite build`. It writes into `build/`:
| Output | What it's for |
|---|---|
| `apps/<slug>.html`, `fr/apps/…`, `de/apps/…` | One readable page per approved app and language: title, description, MIND's evaluation, rater review, store description, links, structured data, language alternates, and the app's record as JSON so the site shows it immediately |
| `index.html`, `Apps.html`, `fr/Apps.html`, `de/Apps.html` | The library: every app with a link |
| `FrameworkQuestions.html`, `Community.html`, `SuggestApp.html` | Title and description only (the app renders the content), so these answer with 200 instead of 404 |
| `sitemap.xml` | Every page, with its last-updated date and language alternates (referenced from `robots.txt`) |
| `llms.txt` | A plain-text overview of MIND and every app, for AI tools |

- GitHub Pages serves `apps/x.html` at `/apps/x`. Addresses without a file fall back to `404.html` (the
  plain app), which looks the app up, so apps approved since the last build still work for visitors.
- Wording: `src/seo/pageText.ts`, translated through the normal catalogs (`npm run i18n:extract`).
- Never embedded: `email`, `approverEmail`, `uid` (`PRIVATE_FIELDS` in the generator).
- Everything is regenerated each build (about 3 seconds). Output is identical when the data hasn't changed.
- In CI the build fails if the app list can't be read (or returns fewer than 100 apps), so a deploy never
  ships without app pages. Locally it just warns and skips.

### When pages update
`.github/workflows/production.yml` deploys on every push to `master` and **every Monday at 09:00 UTC**,
which picks up newly approved and edited apps. To publish sooner: Actions → "Deploy to GitHub Pages" →
Run workflow.

### Analytics and consent
- Google Analytics 4 (`G-NMVKGDPRMS`, account "MIND"), loaded in `index.html` on `mindapps.org` only.
- Visitors in the EEA, UK and Switzerland get no analytics cookies unless they accept the banner
  (`src/components/layout/AnalyticsConsentBanner.tsx`, `src/analytics/consent.ts`). The footer's
  "Cookie settings" link reopens it.
- Search Console: Domain property `mindapps.org`, verified by a DNS TXT record in Route 53, and linked to
  the Analytics property.
