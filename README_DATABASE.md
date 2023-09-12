## AWS Dynamo Database Notes

**table: applications**
  
  1. The applications and review data is stored in AWS dynamo.  See the [copyDatabaseExample.js](https://github.com/BIDMCDigitalPsychiatry/AppMapDB/blob/master/scripts/copyDatabaseExample.js) file for a node example of how to connect to and/or copy the database.
  
  2. We keep an entire history of all app reviews.
     - Each review is a new record in the database with a link to it's parent review.
     - The structure of the application table can be viewed in the [Application.tsx](https://github.com/BIDMCDigitalPsychiatry/AppMapDB/blob/master/src/database/models/Application.tsx#L521) file.  Look for the "interface Application".  This represents each row in the database.  There are other questions and types also defined in this file.  These define how the data is stored and what options are available at the current time.
  
  3. When information is displayed to the end user, there are three modes:
     - admin:  Admin users can login and are responsible for approving reviews.  Reviews will not be visible to the public until they are marked approved.
     - app rater: App rating users can login and are allowed to submit new reviews or update an existing review.  
     - public: The public users only see the most recently approved app review for each application in the database.  Public users can see a history of the Qualatative Review and Ratings if the click on the App to view it and then navigate through the review history.
    
     For an example of how we query the database and filter the results based on the user type, review dates, user selected filters, etc, see: [useAppDataTable.tsx](https://github.com/BIDMCDigitalPsychiatry/AppMapDB/blob/master/src/components/pages/useAppTableData.tsx)
    
  









