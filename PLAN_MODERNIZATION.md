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

- [ ] **`users` table** (create in AWS + seed): keyed by lowercased `email`; fields `roles` (admin/tester/notify), `active`, `created`/`updated`/`updatedBy` audit fields. Seeded once from the package.json `adminUsers`/`testUsers`/`emailUsers` lists. Creation script committed under `infrastructure/` (reproducible — first step toward IaC).
- [ ] **Write-API Lambda** (`cloud_functions/mindapps-write-api/`, mirroring the search-assistant's adapter pattern; deployed behind a Function URL with CORS):
  - Verifies the caller's Cognito ID token (`aws-jwt-verify` against pool `us-east-1_hXektTdUL`); the caller's email comes from the **verified token**, never the request body.
  - Same `{Model, Action, Data}` contract as `useProcessData` — the frontend transport swap is contained to that one file.
  - **Authorization matrix** (server-enforced): create rating/draft → any signed-in user (row `email` forced to token email); edit → own rows for raters, anything for admins; `approved`/`delete` transitions → admins only; users-table management → admins only; community posts/comments → signed-in users.
  - Runs the `cur`-flag recompute + email normalization **server-side** (ported from `src/database/currentFlags.ts` / `normalize.ts`).
  - Structured log line for every privileged action (who/what/when) → CloudWatch audit trail.
  - Scoped execution role (new, additive): DynamoDB on `applications`/`users` (+ community tables) + CloudWatch Logs only.
- [ ] **Frontend transport swap** in `useProcessData`: authenticated models (applications, posts, comments, team, events, filters) go through the API with the session ID token; anonymous public writes (surveys, signUpSurveys, tracking) continue direct — they cannot be authenticated and IAM is not changing. Local-data dev mode unaffected. `REACT_APP_WRITE_API_URL` baked into the production build (empty = direct-write fallback, the instant rollback).
- [ ] **Duplicate-group prevention hardening**: the server re-runs the existing-groupId lookup on create (belt to the client's suspenders).
- [ ] **Negative tests**: rater attempting approve → 403; anonymous attempting any API write → 401; spoofed `email` in payload → overwritten with token email.
- [x] **SES audit** (investigation only — nothing changed): all browser email flows live in `src/components/pages/Survey/sendSurveyEmail.tsx`, sending as `appmap@psych.digital` via the public role: (1) survey-confirmation to the participant, (2) staff notification to `surveyNotificationEmail`, (3) follow-up survey invitation. Also referenced from `Survey.tsx`, `SurveyFollowUp.tsx`; `SuggestEdit`/`RateAnApp` matches to be confirmed in-code. **Decision deferred**: these are real, used features; moving them behind the API (and only then revoking `ses:SendEmail`) is part of the later lockdown.
- [x] **Anonymous-tables audit**: the site's public visitors WRITE to `tracking` (analytics), `surveys`, `signUpSurveys` — these can never be publicly read-only. Later-lockdown design: public role keeps `PutItem` but loses read actions on them (write-only telemetry pattern); admin reads move behind the API.

**Deferred to the post-partner-conversation lockdown (unchanged from before):** IAM write removal from the public role, `ses:SendEmail` revocation, sensitive-table read restriction, retirement of the package.json fallback.

## 2. User & role management

Rosters currently ship in the public JS bundle (26 staff emails) and changing them requires a developer redeploy.

- [ ] `users` table (shared with §1) as the single source of truth; package.json lists remain as **fallback only** until Chris retires them.
- [ ] Admin **"Users" page** (new tab in the Admin area, built from the existing table/dialog machinery): list users with roles + active status; add by email; toggle admin/tester/notify; deactivate. Guardrails: an admin cannot remove their own admin role; the last active admin cannot be deactivated.
- [ ] All Users-page mutations go through the write-API (admin-only server-side) with the audit fields stamped.
- [ ] Frontend `useIsAdmin`/`useIsTestUser`/notification-recipient reads: users table first, package.json fallback.
- [ ] Seed script + verification (roster in table matches package.json at seed time).

## 3. Frontend performance (quick wins)

- [ ] **Retire the legacy data pipeline** still powering the pending/history/archived tables (quadratic per-group re-scans, unmemoized, substring `isMatch` filter bug) in favor of the shared optimized helpers used by the main library since July (single-pass dedupe, exact tag matching, memoization).
- [ ] **Fix re-render storms**: Redux selectors that return fresh object literals on every call (e.g. `|| {}` fallbacks) re-render every table on any action — replace with stable references/`shallowEqual`.
- [ ] **Route-level code splitting**: `React.lazy` the page-level routes so the public library doesn't ship admin/community/survey code on first paint.
- [ ] **AWS SDK v2 → v3**: replace the monolithic `aws-sdk` (~700 KB gzipped in the bundle for a handful of calls) with modular v3 clients (`@aws-sdk/lib-dynamodb`, `@aws-sdk/client-ses`, Cognito credential provider) behind a thin same-shape adapter in `dbConfig.ts` so the ~30 call sites don't churn. `aws-sdk` v2 remains a dev-dependency for the Node scripts.
- [ ] Debounced search verified everywhere a search box renders.
- [ ] Dead-file removal (conservative): `useAppTableData.tsx.old` and other clearly unreferenced files only.
- **Deferred (per Chris):** moving the ~98 MB of MP4s out of the repo to media hosting — documented, not implemented. Also deferred: date/virtualization library consolidation (recommend folding into the React 18 program).

## 4. Platform modernization

- [ ] **CRA → Vite migration**: CRA is unmaintained (no security fixes, webpack conflict silenced by `SKIP_PREFLIGHT_CHECK`). Vite build with `envPrefix: 'REACT_APP_'` (no env renames), output kept at `build/` so the Pages deploy flow is unchanged, `copy404` preserved. Site behavior and hosting identical.
- [ ] **Jest → Vitest**: `react-scripts test` goes away with CRA; the existing suites (55 tests) run under Vitest with jsdom. The pnpm-layout transform hacks become unnecessary.
- [ ] **CI workflow**: new GitHub Actions job on every PR — install, type-check (`tsc --noEmit`), test, build. Today nothing runs automatically. Requires committing a lockfile (`pnpm-lock.yaml`) for reproducible installs — first one in repo history, intentional.
- [ ] **`marked` 2 → 4**: clears the last 3 high-severity Dependabot alerts (ReDoS). Two call sites (`helpers.tsx` `stripContent`, Community `Details.tsx`); v4 named-export + `marked.parse` API.
- [ ] **IaC (incremental start)**: every AWS resource this branch creates (users table, Lambda, its role, Function URL) is created by committed scripts under `infrastructure/` — reviewable and re-runnable. Full IaC adoption for the pre-existing console-created stack stays an ongoing program.
- [ ] **Survey-reminder Lambda runtime audit** (investigation): confirm its runtime/SDK still function on current AWS runtimes; document findings.
- **Explicitly excluded (own scoped program, per the architecture review):** `@mui/styles` retirement (86 files) → React 18 + current MUI.

---

## Verification & safety

- Full test suite + production build green at every stage; final localhost smoke test against the real database.
- New AWS resources are inert until merge: nothing existing is modified — no IAM policy edits, no changes to existing tables/Lambdas.
- Rollback: unset `REACT_APP_WRITE_API_URL` → frontend reverts to today's direct writes; the users table/Lambda can sit unused indefinitely.

## Effort reference (architecture review)
Security ~10h · Users/roles ~6h · Performance ~6h · CI+Vite ~10h — this branch implements all four with the noted deferrals.
