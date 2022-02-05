import React from 'react';
import { AppState } from '../../../../store';
import { getDayTimeFromTimestamp, isEmpty, sortDescending } from '../../../../helpers';
import { tables } from '../../../../database/dbConfig';
import { AndroidStoreProps } from '../../DialogField/AndroidStore';
import { AppleStoreProps } from '../../DialogField/AppleStore';
import { useSelector } from 'react-redux';
import { useHandleExport } from '../../../../database/hooks';
import { surveyQuestionKeys } from '../../../pages/Survey/Survey';

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

export const useSurveyExport = table => {
  const surveys = useSelector((s: AppState) => s.database[tables.surveys] ?? {});
  const surveyReminders = useSelector((s: AppState) => s.database[tables.surveyReminders] ?? {});

  const columns = [
    { name: 'appName' },
    { name: 'surveyType' },
    { name: 'followUpCompleted' },
    { name: 'lastReminderSent' },
    ...surveyQuestionKeys.map(name => ({ name })),
    { name: 'created' },
    { name: 'updated' },
    { name: 'deleted' },
    { name: '_id' }    
  ];

  var data = surveys
    ? Object.keys(surveys).map(k => {
        const survey = surveys[k];
        const { app = {}, surveyType } = survey;

        const surveyReminderKeys = Object.keys(surveyReminders)
          .filter(k => surveyReminders[k].surveyId === survey._id)
          .sort((a, b) => sortDescending(surveyReminders[a].time, surveyReminders[b].time)) as any;

        const surveyReminder = !isEmpty(surveyReminderKeys[0]) ? surveyReminders[surveyReminderKeys[0]] : {};
        const lastReminderSent = !isEmpty(surveyReminder?.time) ? surveyReminder?.time : undefined;
        const followUpCompleted = surveyType === '6 Week' ? 'N/A' : Object.keys(surveys).find(k => surveys[k].parentId === survey._id) ? 'True' : 'False';

        return {
          _id: survey._id,
          appName: getAppName(app),
          surveyType,
          followUpCompleted,
          lastReminderSent: lastReminderSent ? getDayTimeFromTimestamp(lastReminderSent) : '',
          ...survey,
          created: survey?.created ? getDayTimeFromTimestamp(survey.created) : '',
          updated: survey?.updated ? getDayTimeFromTimestamp(survey.updated) : ''
        };
      })
    : [];

  const handleExport = useHandleExport(data, columns);
  return React.useCallback(() => handleExport(true), [handleExport]);
};
