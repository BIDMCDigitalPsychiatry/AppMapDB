import * as React from 'react';
import { AppState } from '../../../../store';
import Application from '../../../../database/models/Application';
import { isEmpty, getDayTimeFromTimestamp } from '../../../../helpers';
import { useTableFilter } from '../helpers';
import { dynamo, tables } from '../../../../database/dbConfig';
import { AndroidStoreProps } from '../../DialogField/AndroidStore';
import { AppleStoreProps } from '../../DialogField/AppleStore';
import logo from '../../../../images/default_app_icon.png';
import { useSelector } from 'react-redux';
import { useSurveys } from '../../../../database/useSurveys';

export const getAppName = app => {
  const androidStore: AndroidStoreProps = app.androidStore;
  const appleStore: AppleStoreProps = app.appleStore;
  return !isEmpty(app.name)
    ? app.name
    : androidStore && !isEmpty(androidStore.title)
    ? androidStore.title
    : appleStore && !isEmpty(appleStore.title)
    ? appleStore.title
    : app.name;
};

export const getAppCompany = app => {
  const androidStore: AndroidStoreProps = app.androidStore;
  const appleStore: AppleStoreProps = app.appleStore;
  return !isEmpty(app.company)
    ? app.company
    : androidStore && !isEmpty(androidStore.developer)
    ? androidStore.developer
    : appleStore && !isEmpty(appleStore.developer)
    ? appleStore.developer
    : app.company;
};

export const getAppIcon = (app: Application) => {
  const androidStore: AndroidStoreProps = app.androidStore;
  const appleStore: AppleStoreProps = app.appleStore;
  return !isEmpty(app.icon)
    ? app.icon
    : androidStore && !isEmpty(androidStore.icon)
    ? androidStore.icon
    : appleStore && !isEmpty(appleStore.icon)
    ? appleStore.icon
    : logo;
};

export const useSurveyData = table => {
  const surveys = useSelector((s: AppState) => s.database[tables.surveys] ?? {});

  const [, setRows] = useSurveys();

  // Load data from the database
  React.useEffect(() => {
    const getItems = async () => {
      let scanResults = [];
      let items;
      var params = {
        TableName: tables.surveys,
        ExclusiveStartKey: undefined
      };
      do {
        items = await dynamo.scan(params).promise();
        items.Items.forEach(i => scanResults.push(i));
        params.ExclusiveStartKey = items.LastEvaluatedKey;
      } while (typeof items.LastEvaluatedKey != 'undefined');
      setRows(
        scanResults.reduce((f, c: any) => {
          f[c._id] = c;
          return f;
        }, {})
      );
    };
    getItems();
  }, [setRows]);

  var data = surveys
    ? Object.keys(surveys).map(k => {
        const survey = surveys[k];
        const { app = {} } = survey;        

        const searchableProps = {
          app: getAppName(app),          
          updated: app.updated ? getDayTimeFromTimestamp(app.updated) : undefined,
          company: getAppCompany(app),
          costs: app.costs?.join(' '),
          platforms: app.platforms?.join(' '), // for searching
          features: app.features?.join(' '), // for searching
          functionalities: app.functionalities?.join(' '),
          engagements: app.engagements?.join(' '),
          inputs: app.inputs?.join(' '),
          outputs: app.outputs?.join(' '),
          conditions: app.conditions?.join(' '),
          privacies: app.privacies?.join(' '),
          uses: app.uses?.join(' '),
          clinicalFoundations: app.clinicalFoundations,
          developerTypes: app.developerTypes
        };

        return {
          _id: survey._id,
          app,
          ...searchableProps,
          getSearchValues: () => {
            return Object.keys(searchableProps).reduce((f, c) => (f = [f, searchableProps[c]].join(' ')), ''); // Optimize search performance
          },
          getValues: () => survey,
          email: survey['What is the best email address we can reach you at?'],
          created: survey.created,
          updated: survey.updated
        };
      })
    : [];

  return useTableFilter(data, table);
};
