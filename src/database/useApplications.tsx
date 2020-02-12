import { tables } from './dbConfig';
import { useTableState } from './useTableState';
import { useSelector } from 'react-redux';
import { AppState } from '../store';

export const useApplications = () => useTableState(tables.applications);
export const useApp = id => useSelector((state: AppState) => (state.database[tables.applications] ?? {})[id]);
