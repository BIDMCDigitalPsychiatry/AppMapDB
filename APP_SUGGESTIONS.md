## App Suggestions ("Suggest an App")

An in-app form where developers (or anyone) suggest a mental health app for
MINDapps. It replaced the Google Form in October 2026 (PRs #138–#142).
Suggestions are stored in DynamoDB. Reviewers are emailed and work through
them in **Admin → App Suggestions**, where one click turns a suggestion into a
pre-filled app rating.

Internal code uses "submission" (`appSubmissions` table, `submission` API
route, `SubmitApp/` folder). Everything users see says "suggestion", so it
isn't confused with the app *rating* workflow.

### Where it lives

| Piece | Location |
|---|---|
| Public form (route `/SuggestApp`) | `src/components/pages/SubmitApp/SubmitApp.tsx` |
| Step screens + read-only summary | `src/components/pages/SubmitApp/steps.tsx` |
| **All question wording / hints / "More info"** | `src/components/pages/SubmitApp/content.ts` |
| Validation, drafts, store-link parsing, suggestion → rating mapping | `src/components/pages/SubmitApp/form.ts` (+ `form.test.ts`) |
| Field components (Yes/No/Not sure, checklists, help text) | `src/components/pages/SubmitApp/fields.tsx` |
| Entry button ("Suggest an App", App Library filter panel) | `src/components/pages/Community/InterestedAddApp.tsx` |
| Admin queue | `src/components/pages/Admin/AppSubmissions.tsx` |
| API client | `src/database/appSubmissions.ts` |
| "Not sure" highlighting in the rating form | `src/components/application/DialogField/ReviewFlags.tsx`, `YesNoGroup.tsx` |
| Lambda: validation | `cloud_functions/mindapps-write-api/submissions.js` (+ `submissions.test.js`) |
| Lambda: routes | `cloud_functions/mindapps-write-api/handler.js` (`handleSubmission`) |
| Lambda: reviewer email template | `cloud_functions/mindapps-write-api/email.js` (`INTERNAL_EMAIL_TYPES.appSubmission`) |
| Table creation | `infrastructure/createSubmissionsTable.js` |

### The form

- 12 sections plus a review page. Wide screens get a section sidebar; phones get a progress bar.
  1. About you
  2. The app
  3. Eligibility (the 4 criteria + risks)
  4. Research
  5. Conditions, cost & developer
  6. Privacy & security
  7. Functionality
  8. Clinical foundations & treatment approaches
  9. Features & engagement
  10. Inputs & outputs
  11. Intended use & availability
  12. Anything else
- Every question has an always-visible hint. Many also have an expandable
  **More info**. The wording is adapted from the team's App Rater Help Guide,
  rewritten for developers.
  - **To change wording, edit `content.ts` only.**
  - `value` keys in `content.ts` must match the stored rating values in
    `src/database/models/Application.tsx`. A test enforces this.
- Yes/No questions offer **Not sure**.
- **Research detail questions** only appear if the app has at least one study.
- **Privacy follow-ups** are skipped when there's no privacy policy.
- **Follow-up fields** (e.g. which accessibility features) appear right under the question that triggers them.
- **Store links:**
  - App Store and Google Play links are each looked up separately (through
    `googlePlayProxyUrl`) and show "Found on App Store / Google Play", or
    "couldn't find". Each re-checks when its link changes.
  - Links must be real store links (`apps.apple.com/…/id123`,
    `play.google.com/…?id=pkg`).
  - A warning appears if the two stores return different apps.
  - Websites are not looked up.
  - The first store result fills in the app name and developer if they're empty.
- **Drafts** are saved in the visitor's `localStorage` (`mindapps.submitApp.draft.v1`) and restored on return.
- **No email** is sent to the submitter. They only see a thank-you screen.

### Backend

**Table `appSubmissions`:**
- PK `_id`, on-demand, point-in-time recovery on.
- It is **not** readable by the public Cognito role (rows hold submitter
  names and emails). Only the write-API Lambda's role can access it.

**Write API:** body `{ submission: { op, data } }`.

| op | Who | What |
|---|---|---|
| `submit` | anyone, no login | Validates against a fixed schema, stores the suggestion with status `new`, emails reviewers |
| `list` | Submission Reviewer or Super Admin (token verified) | Returns all suggestions, newest first |
| `update` | same | Sets `status` / `ratingId` and appends a note to `notes[]` with who/when |

**Statuses:** `new` → `inreview` → `converted` (rating created) / `declined` / `duplicate`. Declined and duplicate can be reopened to `new`.

**Abuse protections on `submit`:**
- Unknown fields are dropped; text is length-capped; choices are whitelisted; links must be `https://`.
- Total payload is capped at about 100 KB.
- The server sets `_id`, `status` and timestamps.
- A hidden honeypot field (`website`) makes the server pretend success and store nothing.
- The API Gateway throttle (10 rps / burst 25) is shared with the whole write API.
- **Not implemented:** CAPTCHA and per-IP limits. If spam appears, add Cloudflare Turnstile first.

**Reviewer email (`appSubmission`):**
- Internal-only: the public email route can't trigger it, so every email has a stored row behind it.
- Goes to every active roster user with the `submissionreviewer` role.
- Links to `/Admin?tab=submissions`.
- A failed email never fails the submit.

### Roles: who sees what

| Role (users table) | App Suggestions tab | Gets the email |
|---|---|---|
| `submissionreviewer` ("Submission Reviewer") | yes | yes |
| `superadmin` | yes | only if also Submission Reviewer |
| `admin` | only if also Submission Reviewer | only if also Submission Reviewer |
| raters / public | no | no |

- Roles are assigned in **Admin → Users** (Super Admins only).
- A Submission Reviewer who isn't an admin still gets the Admin tab in the top
  bar, but sees only App Suggestions.
- The server re-checks the role on `list` and `update`.

### Review queue → rating

- **Detail view:**
  - All of the suggestion's answers.
  - A warning if the app may already be in the library (matched by store ID or website).
  - A list of "Not sure" answers.
  - The status-change history with notes.
- **Mark in review / Decline / Mark duplicate** only change the status (plus an optional note). Nobody is emailed and nothing is deleted.
- **Create rating:**
  - Opens the standard rating dialog (`RateNewAppDialog`) pre-filled by `toRatingValues()`:
    - platforms come only from the links given;
    - "Yes" answers become selected values;
    - checklists are copied;
    - unknown values are dropped;
    - `submissionId` is stored on the rating for traceability.
  - Questions answered **Not sure** start unanswered and are highlighted orange.
    Saving is blocked until each one gets a Yes or No. The flags travel in
    `ReviewFlagsContext`, which only the queue provides, so no other rating
    form is affected and nothing extra is saved.
  - The rating saves like any new rating: unapproved, and listed in **Pending
    Approvals**. If the app is already in the library, it joins that app's group
    as a newer revision. After saving, the suggestion becomes `converted` with
    `ratingId` set.
  - Nothing goes public until an admin approves the rating.

### Operations

- Deploy Lambda changes: `node infrastructure/createWriteApi.js --profile <admin> --apply`.
  It bundles `cloud_functions/mindapps-write-api`, updates the code and the IAM
  policy, which includes `appSubmissions`.
- Create the table (already done; the script can be re-run safely):
  `node infrastructure/createSubmissionsTable.js --profile <admin> --apply`
- Tests: `npx vitest run src/components/pages/SubmitApp cloud_functions`
- The original Google Form ("MINDapps Developer Guide") and the App Rater Help
  Guide spreadsheet are the source documents for the questions and help text.
