## app-map-db-survey-reminders
AWS Lambda function responsible for automatically sending survey reminders.

## AWS Setup/Configuration
  
  **AWS Lambda Function Installation**
  
  Create the AWS lambda function via the AWS lambda console or similar method, then perform one of the following:
  
  1. Copy index.js to lambda code in the AWS lambda console and hit the deploy button.
  
  OR 

  1. Run npm install to generate the node_modules directory.
  2. Zip contents of folder and upload to AWS lambda console.

  **Automatic AWS Lambda Execution**
  
  The lambda function is executed every hour via the AWS EventBridge and the app-map-db-survey-reminders-schedule rule.  
  
  See here for more information: https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/RunLambdaSchedule.html