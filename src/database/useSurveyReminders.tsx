import { tables } from './dbConfig';
import { useTableState } from './useTableState';
import { useSelector } from 'react-redux';
import { AppState } from '../store';

export const useSurveyReminders = () => useTableState(tables.surveyReminders);
export const useSurveyReminder = id => useSelector((state: AppState) => (state.database[tables.surveyReminders] ?? {})[id]);
