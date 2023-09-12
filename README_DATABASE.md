1. The database is stored in AWS dynamo.  See this example of a node js script for instructions on how to connect and/or copy the database.

2. We keep an entire history of all app reviews.
    Each review is a new record in the database with a link to it's parent review.
    The structure of the application table can be viewed in the Application.tsx file.  Look for the "interface Application" structure.  This represents each row in the database.
    There are other types and questions defined in this file that also define how the data is stored and what options are available.

