import { tables } from './dbConfig';
import { useTableState } from './useTableState';

export const useApplications = () => useTableState(tables.applications);
