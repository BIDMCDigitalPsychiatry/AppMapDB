import * as React from 'react';
import { dynamo, tables } from './dbConfig';
import { useSignedIn } from '../hooks';

export const useGetSignUpSurveys = () => {
  const signedIn = useSignedIn();

  // Load data from the database
  const getSignUpSurveys = React.useCallback(async () => {
    let scanResults = [];
    if (signedIn) {
      let items;
      var params = {
        TableName: tables.signUpSurveys,
        ExclusiveStartKey: undefined
      };
      do {
        items = await dynamo.scan(params).promise();
        items.Items.forEach(i => scanResults.push(i));
        console.log({ items, scanResults });
        params.ExclusiveStartKey = items.LastEvaluatedKey;
      } while (typeof items.LastEvaluatedKey != 'undefined');
    }
    return scanResults;
  }, [signedIn]);

  return { getSignUpSurveys };
};
