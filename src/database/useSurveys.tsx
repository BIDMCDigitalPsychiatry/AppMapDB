import { tables } from './dbConfig';
import { useTableState } from './useTableState';
import { useSelector } from 'react-redux';
import { AppState } from '../store';

export const useSurveys = () => useTableState(tables.surveys);
export const useSurvey = id => useSelector((state: AppState) => (state.database[tables.surveys] ?? {})[id]);
