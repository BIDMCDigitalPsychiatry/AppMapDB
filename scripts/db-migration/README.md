# Database Migration Scripts (Phase 0)

Tooling for the index/performance work described in `PLAN_DATABASE_INDEXES.md`.

**Every script is a DRY RUN by default** — it prints exactly what it would
change and writes nothing. Add `--apply` to execute. Nothing here should be
run with `--apply` until the plan owner has reviewed the dry-run output.

## Credentials

These scripts need an **admin AWS profile** (index creation uses `UpdateTable`).
They do NOT use the app's public Cognito pool. Pass `--profile <name>` or set
`AWS_PROFILE`. Region and table name come from `package.json`.

## Run order

| # | Script | What it does | Prereq |
|---|--------|--------------|--------|
| 0 | (deploy frontend) | `useProcessData` lowercases emails on write | code fix merged & deployed FIRST |
| 1 | `01_migrate_emails.js` | lowercase `email`/`approverEmail` on existing rows (121 rows as of 2026-08-25) | step 0 deployed |
| 2 | `02_merge_duplicate_groups.js` | merge the split groups for CBT Companion, Dare, Slumber (9 rows; Welltory deliberately kept split) | — |
| 3 | `03_create_indexes.js` | create `current-index`, `group-index`, `email-index` (sequential; waits for ACTIVE; rerunnable) | — |
| 4 | `04_backfill_current_flags.js` | set `groupId = _id` on 51 legacy rows; stamp `cur` on ~1,823 current rows | run AFTER 2 (so flags see merged groups) |
| 5 | `04_backfill_current_flags.js` (no `--apply`) | verify: should print `0 differences` | after 4 |

Also required once (manual, AWS console/IAM): allow `dynamodb:Query` on
`arn:aws:dynamodb:*:*:table/applications/index/*` for the app's Cognito
role(s), or the frontend's index queries will be denied.

## Ongoing

Until Phase 2 moves writes behind an authenticated Lambda, `cur` flags are
maintained by the frontend (`useProcessData`). Any writer that bypasses the
frontend (external organization, AWS console edits) can cause drift — run
step 5 periodically as an audit; add `--apply` to repair whatever it reports.

## Rollback

- Merges: original groupIds are printed in each apply log; re-point them back.
- Flags/`groupId` repairs: `cur` is inert to all pre-index code; removing the
  attribute (or deleting the indexes) restores the exact prior state.
- Emails: original casings are printed in the apply log.
