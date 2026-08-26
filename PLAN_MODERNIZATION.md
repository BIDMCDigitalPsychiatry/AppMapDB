# Security & Modernization Plan (Phases 2–4)

**Status:** in implementation on `feature/security-modernization`
**Owner:** Chris Van Emmerik · **Drafted:** 2026-08-25
**Follows:** `PLAN_DATABASE_INDEXES.md` (Phase 0/1 — index solution, complete & live)

**Ground rules for this branch (per Chris, 2026-08-25):**
- **Nothing here may change current production behavior** — the branch will not be merged immediately, and every AWS resource created (Lambda, users table) is inert until the frontend that calls it is merged and deployed.
- **The database stays open**: NO changes to existing IAM roles/policies. The external organization (and anyone else) writing directly keeps working. The final lockdown is a separately scheduled IAM-only change after partners are consulted.
- **SES stays untouched** until the email audit below is reviewed (no `ses:SendEmail` revocation).
- **Rollout posture:** the write-API path activates **when this branch merges** (URL baked into the build). Admin UI checks read the new `users` table with the package.json lists as fallback.

---

## 1. Security lockdown (modified scope: build the checkpoint, leave the side door open)

Today every visitor's browser holds credentials that can write all 10 tables and send email as mindapps.org, and "is admin" is a cosmetic browser-side check. This phase adds real server-side enforcement for the app's own workflows without locking anything down yet.

- [x] **`users` table** created + seeded 2026-08-25 (28 distinct emails, roles merged from the three package.json lists); creation script committed under `infrastructure/` (reproducible — first step toward IaC).
- [x] **Write-API Lambda** deployed 2026-08-25 (`cloud_functions/mindapps-write-api/`, mirroring the search-assistant's adapter pattern; behind API Gateway — Lambda Function URLs are publicly blocked in this account — endpoint `https://c9f9mkxos6.execute-api.us-east-1.amazonaws.com`; verified rejecting missing/forged tokens with 401):
  - Verifies the caller's Cognito ID token (`aws-jwt-verify` against pool `us-east-1_hXektTdUL`); the caller's email comes from the **verified token**, never the request body.
  - Same `{Model, Action, Data}` contract as `useProcessData` — the frontend transport swap is contained to that one file.
  - **Authorization matrix** (server-enforced): create rating/draft → any signed-in user (row `email` forced to token email); edit → own rows for raters, anything for admins; `approved`/`delete` transitions → admins only; users-table management → admins only; community posts/comments → signed-in users.
  - Runs the `cur`-flag recompute + email normalization **server-side** (ported from `src/database/currentFlags.ts` / `normalize.ts`).
  - Structured log line for every privileged action (who/what/when) → CloudWatch audit trail.
  - Scoped execution role (new, additive): DynamoDB on `applications`/`users` (+ community tables) + CloudWatch Logs only.
- [x] **Frontend transport swap** in `useProcessData`: authenticated models go through the API with the session ID token; anonymous public writes (surveys, signUpSurveys, tracking) continue direct; local-data dev mode unaffected; `REACT_APP_WRITE_API_URL` baked into `.env` + the deploy workflow (empty = direct-write fallback, the instant rollback).
- [x] **Negative tests**: `authz.test.js` (runs in CI) pins the matrix — rater approve → denied; spoofed `email` → overwritten with token email; users management → admin-only; plus live endpoint checks (no/forged token → 401).
- Note: server-side duplicate-group lookup on create deferred (client-side prevention from Phase 1 remains; add when the Lambda owns creates exclusively).
- [x] **SES audit** (investigation only — nothing changed): all browser email flows live in `src/components/pages/Survey/sendSurveyEmail.tsx`, sending as `appmap@psych.digital` via the public role: (1) survey-confirmation to the participant, (2) staff notification to `surveyNotificationEmail`, (3) follow-up survey invitation. Also referenced from `Survey.tsx`, `SurveyFollowUp.tsx`; `SuggestEdit`/`RateAnApp` matches to be confirmed in-code. **Decision deferred**: these are real, used features; moving them behind the API (and only then revoking `ses:SendEmail`) is part of the later lockdown.
- [x] **Anonymous-tables audit**: the site's public visitors WRITE to `tracking` (analytics), `surveys`, `signUpSurveys` — these can never be publicly read-only. Later-lockdown design: public role keeps `PutItem` but loses read actions on them (write-only telemetry pattern); admin reads move behind the API.

**Deferred to the post-partner-conversation lockdown (unchanged from before):** IAM write removal from the public role, `ses:SendEmail` revocation, sensitive-table read restriction, retirement of the package.json fallback.

## 2. User & role management

Rosters currently ship in the public JS bundle (26 staff emails) and changing them requires a developer redeploy.

- [x] `users` table (shared with §1) as the single source of truth; package.json lists remain as **fallback only** until Chris retires them.
- [x] Admin **"Users" page** (`Admin → Users` tab): list users with roles + active status; add by email; toggle admin/tester/notify; deactivate. Guardrails: an admin cannot remove their own admin role; the last active admin cannot be deactivated (enforced in UI and server).
- [x] All Users-page mutations go through the write-API (admin-only server-side) with `updated`/`updatedBy` audit fields stamped.
- [x] Frontend `useIsAdmin`/`useIsTestUser` read the roster first (deactivation wins even for package.json-listed emails), package.json fallback otherwise. Notification recipients still read package.json (their senders move server-side with the SES work).
- [x] Seed script (`infrastructure/createUsersTable.js`) — condition-protected so re-runs never clobber manual roster edits.
- [x] **Super Admin role** (added per Chris, 2026-08-25): only Super Admins see the Users tab and may add/edit/deactivate/**hard-delete** users (server-enforced; regular admins denied). Guardrails protect the last active Super Admin/admin and block self-lockout. Seeded: selzzt@bu.edu + cvanem@gmail.com. Users page rebuilt on the shared GenericTable (full width/height, footer, sortable, role-info tooltips, combined Actions column).
- [x] **Tester role removed** (dead for years — zero call sites); `testUsers` dropped from package.json. **Notify email typo fixed**: `nalon@bidmc.harvad.edu` → `harvard.edu` in package.json and the users table (that recipient had silently received no notification emails).

## 3. Frontend performance (quick wins)

- [x] **Legacy data pipeline retired**: `Applications/selectors.tsx` hooks now memoize, dedupe in a single pass, and use the main library's exact-match filter logic (substring bug fixed); the two never-imported duplicate selector files deleted.
- [x] **Re-render storms fixed**: stable `EMPTY_OBJECT`/per-table defaults replace fresh-object selector fallbacks (`useTable`, `useTableFilterValues`, filters selectors, per-row selectors).
- [x] **Route-level code splitting**: all pages except the public library + app detail load on navigation (admin 7.9 KB gz, community 158 KB gz, survey 7.9 KB gz chunks etc.).
- [x] **AWS SDK v2 → v3** behind a same-shape adapter in `dbConfig.ts` (call sites unchanged); SES via `sendSesEmail` helper (4 call sites); browser-safe Cognito credential provider (the aggregate package pulls Node-only code); v2 stays a devDependency for the Node scripts.
- [x] Debounced search: all application tables flow through the shared debounced `TableSearchV2` input (verified July work already covered the headers).
- [x] Dead-file removal: `useAppTableData.tsx.old` + the two duplicate selector files.
- **Deferred (per Chris):** moving the ~98 MB of MP4s out of the repo to media hosting — documented, not implemented. Also deferred: date/virtualization library consolidation (recommend folding into the React 18 program).

## 4. Platform modernization

- [x] **CRA → Vite migration**: Vite 5 build with `envPrefix: 'REACT_APP_'` (no env renames), a small plugin compiling the legacy JSX-in-.js files, `react-virtualized` ESM workaround, output kept at `build/` + `copy404` so Pages deploys unchanged; `react-scripts` removed. Verified: production build, dev server smoke test against the live DB (502 apps render; the only broken images were Google Play's icon CDN returning transient 503s).
- [x] **Jest → Vitest**: all suites run under Vitest/jsdom (65 tests incl. the write-API authorization matrix, which jest never covered); pnpm-layout transform hacks gone; localforage mocked (jsdom has no IndexedDB).
- [x] **CI workflow** (`.github/workflows/ci.yml`): every PR runs install → type-check → tests → build; `pnpm-lock.yaml` committed (first lockfile in repo history, intentional); the production deploy workflow switched to the same pinned pnpm toolchain.
- [x] **`marked` 2 → 4**: clears the last high-severity Dependabot alerts; both call sites on the v4 named-export API.
- [x] **IaC (incremental start)**: users table, Lambda, scoped role, and HTTP API are created by committed rerunnable scripts under `infrastructure/`. Full IaC for the pre-existing console-created stack stays an ongoing program.
- [x] **Lambda runtime audit** (2026-08-25, informational): `app-map-db-survey-reminders`, `app-map-db`, and the four Amplify helper functions run **nodejs16.x** (deprecated, no updates since 2022); `CloudWatchImageAPI` is on **nodejs12.x**. They still run today; runtime upgrades should be scheduled (survey-reminders relies on the SDK v2 bundled only in old runtimes).
- **Explicitly excluded (own scoped program, per the architecture review):** `@mui/styles` retirement (86 files) → React 18 + current MUI.

---

## Verification & safety

- Full test suite + production build green at every stage; final localhost smoke test against the real database.
- New AWS resources are inert until merge: nothing existing is modified — no IAM policy edits, no changes to existing tables/Lambdas.
- Rollback: unset `REACT_APP_WRITE_API_URL` → frontend reverts to today's direct writes; the users table/Lambda can sit unused indefinitely.

## Effort reference (architecture review)
Security ~10h · Users/roles ~6h · Performance ~6h · CI+Vite ~10h — this branch implements all four with the noted deferrals.
