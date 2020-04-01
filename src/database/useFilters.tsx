import { tables } from './dbConfig';
import { useTableState } from './useTableState';
import { useSelector } from 'react-redux';
import { AppState } from '../store';

export const useFilters = () => useTableState(tables.filters);
export const useFilter = id => useSelector((state: AppState) => (state.database[tables.filters] ?? {})[id]);
