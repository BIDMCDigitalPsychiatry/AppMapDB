import * as React from 'react';
import { AppState } from '../../../../store';
import Application from '../../../../database/models/Application';
import { isEmpty, getDayTimeFromTimestamp, sortDescending } from '../../../../helpers';
import { useTableFilter } from '../helpers';
import { dynamo, tables } from '../../../../database/dbConfig';
import { AndroidStoreProps } from '../../DialogField/AndroidStore';
import { AppleStoreProps } from '../../DialogField/AppleStore';
import logo from '../../../../images/default_app_icon.png';
import { useSelector } from 'react-redux';
import { useSurveys } from '../../../../database/useSurveys';
import { useSurveyReminders } from '../../../../database/useSurveyReminders';

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
  const surveyReminders = useSelector((s: AppState) => s.database[tables.surveyReminders] ?? {});

  const [, setRows] = useSurveys();
  const [, setReminderRows] = useSurveyReminders();

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

  // Load data from the database
  React.useEffect(() => {
    const getItems = async () => {
      let scanResults = [];
      let items;
      var params = {
        TableName: tables.surveyReminders,
        ExclusiveStartKey: undefined
      };
      do {
        items = await dynamo.scan(params).promise();
        items.Items.forEach(i => scanResults.push(i));
        params.ExclusiveStartKey = items.LastEvaluatedKey;
      } while (typeof items.LastEvaluatedKey != 'undefined');
      setReminderRows(
        scanResults.reduce((f, c: any) => {
          f[c._id] = c;
          return f;
        }, {})
      );
    };
    getItems();
  }, [setReminderRows]);

  var data = surveys
    ? Object.keys(surveys).map(k => {
        const survey = surveys[k];
        const { app = {} } = survey;

        const surveyReminderKeys = Object.keys(surveyReminders)
          .filter(k => surveyReminders[k].surveyId === survey._id)
          .sort((a, b) => sortDescending(surveyReminders[a].time, surveyReminders[b].time)) as any;

        const surveyReminder = !isEmpty(surveyReminderKeys[0]) ? surveyReminders[surveyReminderKeys[0]] : {};

        const lastReminderSent = !isEmpty(surveyReminder?.time) ? surveyReminder?.time : undefined;
        const searchableProps = {
          app: getAppName(app),
          lastReminderSent,
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

        const followUpCompleted = !isEmpty(survey.parentId) ? 'N/A' : Object.keys(surveys).find(k => surveys[k].parentId === survey._id) ? 'True' : 'False';

        return {
          _id: survey._id,
          app,
          isFollowUp: !isEmpty(survey.parentId) ? 'True' : 'False',
          followUpCompleted,
          ...searchableProps,
          getSearchValues: () => {
            return Object.keys(searchableProps).reduce((f, c) => (f = [f, searchableProps[c]].join(' ')), ''); // Optimize search performance
          },
          getValues: () => ({ ...survey, followUpCompleted, lastReminderSent }),
          email: survey['What is the best email address we can reach you at?'],
          created: survey.created,
          updated: survey.updated
        };
      })
    : [];

  return useTableFilter(data, table);
};
