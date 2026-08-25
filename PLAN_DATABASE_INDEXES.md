# Database Performance & Index Plan (Phase 0/1)

**Status:** awaiting final confirmation to start Phase 0/1
**Owner:** Chris Van Emmerik · **Drafted:** 2026-08-25
**Branch:** `feature/db-index-optimization` (all work lands here; merged manually via GitHub)
**Scope guard:** Phases 2–3 are documented for planning but **deferred** — Phase 2 waits on coordination with the external organization that also accesses this database. Nothing in Phase 0/1 changes what any existing client can read or write.

---

## Background (verified against a live table scan, 2026-08-25)

- The applications table is **9,727 rows / 70.6 MB**; the app loads it with a ~71-page browser scan on every visit.
- Users see a "glitch": the grid paints after the first scan page and shows stale 2020–2023 versions (65 of 72 first-painted apps) until the scan finishes.
- **77% of the table's bytes** are Apple/Google store payloads (descriptions 33.6 MB, screenshots 15.1 MB) used only on the detail page.
- The rows any *list* view actually needs (latest approved / latest deleted / latest pending per app) total **1,881 rows ≈ 3.2 MB trimmed**; public-only is **0.9 MB**.
- **121 rows (6 raters) have mixed-case `email`** values (from raw Cognito token casing at insert); `approverEmail` currently has **0** mixed-case rows.

## Solution summary

Three additive Global Secondary Indexes on the existing `applications` table (no rows moved or deleted; full history preserved — per-record archiving semantics unchanged):

| Index | Keys | Serves | Size/query |
|---|---|---|---|
| `current-index` | PK `cur` (approved/deleted/pending), SK `created` | Public library, admin library, pending queue, archived list | 0.9–3.2 MB, sorted newest-first |
| `group-index` | PK `groupId`, SK `created` | History dialog (all ratings, all statuses), "newer version" badge | ~7 rows on demand |
| `email-index` | PK `email`, SK `created` | MyRatings (rater's full personal history incl. superseded rows) | dozens of rows on demand |

Full records (store descriptions/screenshots) are fetched **on demand** by `_id` when a user opens an app (existing `handleGetRow`). Snapshot solution: **not needed** (superseded by the index).

Only `current-index` needs a backfill (stamping `cur`); `group-index` and `email-index` auto-populate from existing attributes.

---

## Phase 0 — Foundation

### 0.1 Email normalization (code first, then data)
- [x] Confirm affected fields: only `email` and `approverEmail` exist in applications rows (all 9,727 rows scanned; no other email-bearing field)
- [x] Confirm counts: **121 mixed-case `email` rows (6 distinct raters); 0 mixed-case `approverEmail` rows**
- [x] Confirm safety: no code compares these fields case-sensitively (`usePendingAppData` lowercases both sides; `useIsAdmin`/`useIsTestUser` use the login token, not DB rows; all other uses are display/export only)
- [x] Locate insertion sources: raw Cognito token email at `RateNewAppDialog.tsx:69`, `RateNewAppCard.tsx:53`, `RatingsColumnHistory.tsx:35` (approverEmail)
- [ ] Code fix: lowercase `Data.email` / `Data.approverEmail` in `useProcessData` (single choke point for all writes)
- [ ] Deploy the code fix to production (master push)
- [ ] Migration script: lowercase `email` on the 121 existing rows (fold into backfill tooling; rerunnable)
- [ ] Run migration under admin AWS profile; verify 0 mixed-case rows remain

### 0.2 Data repair — merge duplicate app groups

4 apps currently show two public cards because a re-review was saved as a "new app" with a fresh `groupId` (the create path in `RateNewAppDialog` always generates one). Fix: re-point the splinter group's rows to the original group's `groupId`; the normal "newest approved wins" dedupe then shows exactly one card. Runs **before** the `cur` backfill so flags are computed on merged groups. Only the `groupId` field changes; no rows deleted; script logs original values for reversibility.

- [x] Identify affected apps and verify via store IDs that the split groups are the same app:
  - **CBT Companion** — both groups `co.swasth.cbtcompanion` (merge 2 rows into 20-row group `28bf26df…`)
  - **Dare** — both groups `ie.johnquirke.dareapp` (merge 2 rows into 20-row group `74d820e3…`)
  - **Slumber** — both groups `com.summermedia.slumber` (merge 5 rows into 17-row group `6addc0f0…`)
  - **Welltory** — ⚠ groups are NOT identical: one lineage is iOS-only (`com.welltory.client`, 10 rows since 2022), the other Android-only (`com.welltory.client.android`, 6 rows since 2023). Same product, but merging means one platform's rating history stops being the displayed record.
- [ ] **DECISION (Chris): merge Welltory or keep two cards?** (recommendation: merge — same product, duplicate cards read as a bug; newest approved rating wins regardless of platform)
- [ ] Merge script (part of the migration tooling): ~15 `UpdateItem` calls re-pointing `groupId`
- [ ] Run merge under admin AWS profile; verify each app shows exactly one public card
- [ ] Prevention (Phase 1 item): on new-app submission, look up existing rows by `appleStore.appId` / `androidStore.appId` and reuse the existing `groupId` (or warn the rater) instead of always generating a fresh one

### 0.3 Indexes + backfill
- [ ] Backfill/reconcile script (`scripts/indexes/`): computes per-app latest approved / latest deleted / latest pending, stamps `cur` on ~1,881 rows, clears stray flags, re-normalizes email casing; **rerunnable as a drift-repair/audit tool**
- [ ] Create 3 GSIs (`current-index` with INCLUDE projection of list fields; `group-index` and `email-index`) — requires admin AWS profile (`UpdateTable`); no downtime, invisible to existing clients
- [ ] Extend the app's Cognito role read policy: `dynamodb:Query` on `table/applications/index/*`
- [ ] Run backfill; verify index counts match analysis (≈505 approved / ≈929 deleted / ≈389 pending)
- [ ] Verification pass: reconcile script reports zero diffs against a fresh full scan

## Phase 1 — Fast reads (frontend)

- [ ] Write path: `cur` flag recompute in `useProcessData` — after each save, query `group-index` for the app and set/clear flags (new rating → `pending`; approve → `approved` + clear predecessor; archive → `deleted` + promote next approved). *Client-side for now; moves into the Phase 2 Lambda unchanged.*
- [ ] `useAppTableData`: replace full-table scan with `current-index` queries (public: `approved`; admin: `approved` + `pending`); keep existing dedupe as a safety net
- [ ] Pending queue + archived list selectors → `current-index` (`pending` / `deleted`)
- [ ] MyRatings → `email-index` query for the signed-in rater (keeps superseded/draft rows visible to their author)
- [ ] History dialog + `useNewerMemberCount` → on-demand `group-index` query
- [ ] App detail / edit dialogs → fetch full record by `_id` on open (existing `handleGetRow`) with a loading state
- [ ] Loading gate: never paint lists from partial data (skeleton until the index query completes; progressive paint is safe because the index returns newest-first)
- [ ] Local-data mode (`localDynamo.ts`): shim `Query`-on-index so offline dev/tests still work
- [ ] Update `ratingLifecycle.test.ts` + add tests for flag recompute logic
- [ ] Verify in production: public load ≤ ~1 s; admin/pending/MyRatings/history all correct; stale-flash glitch gone

## Ongoing (until Phase 2)
- [ ] Schedule/runbook: run the reconcile script periodically (e.g. monthly) — catches drift from writes that bypass our frontend (external org, console edits) since flag upkeep is client-side until Phase 2

---

## Phase 2 — Secure writes (DEFERRED: do NOT start until external-org coordination)

Goal: today the Cognito **unauth** role allows anyone on the internet to write to the tables with no login (top finding of the Aug 2026 architecture review). Put all writes behind an authenticated API, then revoke direct write access.

- [ ] Talk to the external organization: do they **write** (blocked by this phase — coordinate migration) or only **read** (unaffected)? Also flag the email-casing migration from Phase 0.
- [ ] Write API Lambda (API Gateway or Function URL; same deploy path as the search-assistant Lambda)
  - [ ] Validate the Cognito ID token (JWT) on every request
  - [ ] Authorize by role: raters may create ratings / edit their own drafts; only admins may approve, archive, or edit others' records
  - [ ] Move admin/rater role definitions to Cognito **user groups** (replaces the compile-time `adminUsers` list in package.json — adding an admin no longer requires a redeploy)
  - [ ] Move the `cur` flag recompute and email normalization from `useProcessData` into the Lambda (server-side, unbypassable; logic ports unchanged)
- [ ] Point `useProcessData` at the API (it is already the single write choke point, so the app-side change is contained)
- [ ] Lock down IAM: remove `PutItem`/`UpdateItem`/`DeleteItem` from the identity-pool roles; browser keys become read-only (`Query`/`GetItem`/`Scan`); only the Lambda's execution role can write (**breaking for any external writer — coordinate first**)
- [ ] Retire the scheduled reconcile runs (server-side flag upkeep makes them unnecessary; keep the script as an audit tool for console edits)

## Phase 3 — Optional future hardening (no current need; revisit after Phase 2)

- [ ] DynamoDB Streams Lambda that recomputes `cur` flags on ANY table write (covers even AWS-console edits; belt-and-suspenders once the write API exists)
- [ ] Archive table for pre-2024 historical rows — pure hygiene; performance no longer requires it once the index serves all reads (57 MB / 7,846 rows of history could move; History dialog would query both tables)
- [ ] CDN/snapshot layer for public reads — only if traffic grows to where per-visitor DynamoDB reads become a cost concern (not a performance need after Phase 1)
- [ ] Read API: move reads behind the Lambda too, if the table ever needs to stop being publicly readable

## Explicitly rejected / superseded
- ~~Snapshot JSON for public users~~ — redundant once `current-index` exists (and never helped admins)
- ~~Archive table for historical rows~~ — not needed for performance after the index; optional hygiene later
- ~~`emailLower` second field~~ — normalizing `email` in place instead

## Compatibility & rollback
- All Phase 0/1 database changes are **additive** (new attribute on ~1,881 rows, new indexes): external clients scanning/querying the base table see identical behavior. The only value mutation is lowercasing `email` on 121 rows — flag to the external org in case they match email case-sensitively (low risk).
- Rollback: revert the frontend deploy (old scan path still works — base table untouched); indexes can be deleted at any time; `cur` attributes are inert to all old code.

## Cost note
GSI storage (~75 MB for `group-index` ALL-projection + small others) is pennies/month; reads drop from 70.6 MB to ≤3.2 MB per visit, so overall RCU consumption falls sharply.
