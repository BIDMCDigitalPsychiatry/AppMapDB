## AWS Dynamo Database Notes

**table: applications**
  
  1. The applications and review data is stored in AWS dynamo.  See the [copyDatabaseExample.js](https://github.com/BIDMCDigitalPsychiatry/AppMapDB/blob/master/scripts/copyDatabaseExample.js) file for a node example of how to connect to and/or copy the database.
  
  2. We keep an entire history of all app reviews.
     - Each review is a new record in the database with a link to it's parent and groupId so they can easily be tracked and referenced.  We don't ever delete rows or update rows, so syncing the database should be fairly straight forward.  There are some exceptions if we need to do a manual modification script on the database.  This has happened in the past to help reduce overall size, but I don't forsee needing this in the future.
     - The structure of the application table can be viewed in the [Application.tsx](https://github.com/BIDMCDigitalPsychiatry/AppMapDB/blob/master/src/database/models/Application.tsx#L521) file.  Look for the "interface Application".  This represents each row in the database.  There are other questions and types also defined in this file.  These define how the data is stored and what options are available at the current time.
  
  3. When information is displayed to the end user, there are three modes:
     - admin:  Admin users can login and are responsible for approving reviews.  Reviews will not be visible to the public until they are marked approved.
     - app rater: App rating users can login and are allowed to submit new reviews or update an existing review.  
     - public: The public users only see the most recently approved app review for each application in the database.  Public users can see a history of the Qualatative Review and Ratings if the click on the App to view it and then navigate through the review history.
    
     For an example of how we query the database and filter the results based on the user type, review dates, user selected filters, etc, see: [useAppDataTable.tsx](https://github.com/BIDMCDigitalPsychiatry/AppMapDB/blob/master/src/components/pages/useAppTableData.tsx)

  4. **How data is read (since Aug 2026 — the index solution).** The app used to
     download the entire table with a paginated Scan (~70 MB) on every visit,
     which grew slower every year and briefly painted stale historical reviews
     while loading. That was replaced by three Global Secondary Indexes (a
     one-time snapshot-file approach was considered and rejected — it only
     helped public users and required its own refresh pipeline):

     | Index | Keys | Serves |
     |---|---|---|
     | `current-index` | `cur` ('approved' \| 'deleted' \| 'pending') / `created` | all list views — public library, admin library, pending queue, archived list (~4 MB public load) |
     | `group-index` | `groupId` / `created` | an app's full review history, fetched on demand when a history dialog opens |
     | `email-index` | `email` (stored lowercase) / `created` | a rater's own submissions on My Ratings, including superseded ones |

     The `cur` attribute marks each app group's current rows (newest approved /
     newest archived / newest pending — rules in
     [currentFlags.ts](https://github.com/BIDMCDigitalPsychiatry/AppMapDB/blob/master/src/database/currentFlags.ts))
     and is recomputed automatically after every save in
     [useProcessData.tsx](https://github.com/BIDMCDigitalPsychiatry/AppMapDB/blob/master/src/database/useProcessData.tsx).
     Writes made outside the app (scripts, console edits) don't update the
     flags — repair/audit with `scripts/db-migration/04_backfill_current_flags.js`
     (dry run prints `0 differences` when healthy). Full plan and history:
     [PLAN_DATABASE_INDEXES.md](https://github.com/BIDMCDigitalPsychiatry/AppMapDB/blob/master/PLAN_DATABASE_INDEXES.md).
    
  









