## AWS Dynamo Database Notes

**table: applications**
  
  1. The applications and review data is stored in AWS dynamo.  See the [copyDatabaseExample.js](https://github.com/BIDMCDigitalPsychiatry/AppMapDB/blob/master/scripts/copyDatabaseExample.js) file for a node example of how to connect to and/or copy the database.
  
  3. We keep an entire history of all app reviews.
     - Each review is a new record in the database with a link to it's parent review.
     - The structure of the application table can be viewed in the [Application.tsx](https://github.com/BIDMCDigitalPsychiatry/AppMapDB/blob/master/src/database/models/Application.tsx#L521) file.  Look for the "interface Application".  This represents each row in the database.  There are other questions and types also defined in this file.  These define how the data is stored and what options are available at the current time.








