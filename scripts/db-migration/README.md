# Database Migration Scripts (Phase 0)

Tooling for the index/performance work described in `PLAN_DATABASE_INDEXES.md`.

> **STATUS: the full runbook below was executed against production on
> 2026-08-25** (emails normalized, groups merged, indexes created, flags
> backfilled, post-deploy reconcile clean). These scripts remain useful as the
> **ongoing drift audit**: run step 5 (`04` without `--apply`) any time —
> a healthy database prints `0 differences`.

**Every script is a DRY RUN by default** — it prints exactly what it would
change and writes nothing. Add `--apply` to execute. Nothing here should be
run with `--apply` until the plan owner has reviewed the dry-run output.

## Credentials

These scripts need an **admin AWS profile** (index creation uses `UpdateTable`).
They do NOT use the app's public Cognito pool. Pass `--profile <name>` or set
`AWS_PROFILE`. Region and table name come from `package.json`.

## Run order

The email code-fix and the index-reading frontend ship together on the
`feature/db-index-optimization` branch, so the database must be prepared
BEFORE that branch is merged/deployed — the new frontend queries the indexes
on load.

| # | Step | What it does |
|---|------|--------------|
| 1 | review every script's dry-run output | nothing writes without `--apply` |
| 2 | `02_merge_duplicate_groups.js --apply` | merge the split groups for CBT Companion, Dare, Slumber (9 rows; Welltory deliberately kept split) |
| 3 | `03_create_indexes.js --apply` | create `current-index`, `group-index`, `email-index` (sequential; waits for ACTIVE; rerunnable; invisible to the live site) |
| 4 | `04_backfill_current_flags.js --apply` | set `groupId = _id` on 51 legacy rows; stamp `cur` on ~1,823 current rows (after step 2 so flags see merged groups) |
| 5 | `01_migrate_emails.js --apply` | lowercase `email` on existing rows (121 rows as of 2026-08-25) |
| 6 | IAM (manual, AWS console) | allow `dynamodb:Query` on `arn:aws:dynamodb:<region>:<acct>:table/applications/index/*` for the app's Cognito role(s) — without it the new frontend's queries are denied |
| 7 | merge the branch → deploy | new frontend reads the indexes; writes normalize emails + maintain flags |
| 8 | `01` and `04` once more, then `04` without `--apply` | catch rows written by old clients during the window; verify `0 differences` |

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
