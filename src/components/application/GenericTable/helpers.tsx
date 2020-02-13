import { AppState } from '../../../store';
import { GenericTableContainerProps } from './GenericTableContainer';
import * as TableStore from './store';
import { spread } from '../../../helpers';

///////////////////////////////////////////
/////////////// Table Sorters  ////////////
//////////////////////////////////////////

export type SortComparator = 'text';
const sortComparators = {
  text: desc
};

///////////////////////////////////////////
/////////////// Table Filters ////////////
//////////////////////////////////////////

export interface ColumnFilter {
  value: string | boolean;
  column: string;
}

const isMatch = (obj, re) => {
  if (obj.getSearchValues) {
    return obj.getSearchValues().match(re);
  } else {
    for (var attrname in obj) {
      if (['_id', 'id', 'key', 'getValues', 'edit', 'action'].includes(attrname.toLowerCase())) continue;
      if (obj[attrname])
        if (isNaN(obj[attrname])) {
          //only search non numeric values
          try {
            if (obj[attrname].match(re)) return true;
          } catch (e) {
            continue;
          }
        } else {
          //it is a number
          try {
            if (obj[attrname].toString().match(re)) return true;
          } catch (e) {
            continue;
          }
        }
    }
  }
  return false;
};

const isColumnExactMatch = (obj, cf: ColumnFilter) => {
  return obj[cf.column] != null && obj[cf.column] === cf.value ? true : false;
};

//extracts the necessary properties from the table's component props so table_filter can be called
export const tableFilter = (data: any, state: AppState, props: GenericTableContainerProps, customFilter = undefined) => {
  //Extract the table information from the redux store
  const table: TableStore.Table = state.table[props.name];
  var searchtext = table && table.searchtext;

  const columnfilter = table &&
    table.columnfiltervalue != null &&
    table.columnfiltercolumn != null && {
      value: table && table.columnfiltervalue,
      column: table && table.columnfiltercolumn
    };

  const filtered = table_filter(data, columnfilter, searchtext, customFilter);
  return table && table.orderBy ? stableSort(filtered, getSorting(table.orderDirection, table.orderBy, table.sortComparator)) : filtered;
};

export const useTableFilter = (data: any, name: string) => {
  //Extract the table information from the redux store
  const table = TableStore.useTable(name);
  const searchtext = table && table.searchtext;

  const columnfilter = table &&
    table.columnfiltervalue != null &&
    table.columnfiltercolumn != null && {
      value: table && table.columnfiltervalue,
      column: table && table.columnfiltercolumn
    };

  const filtered = table_filter(data, columnfilter, searchtext);
  return table && table.orderBy ? stableSort(filtered, getSorting(table.orderDirection, table.orderBy, table.sortComparator)) : filtered;
};

export const table_filter = (data, columnfilter: ColumnFilter, searchtext, customFilter = undefined) => {
  var performcolumnfilter = false;
  if (columnfilter) if (columnfilter.column) if (columnfilter.value !== 'All' && columnfilter.value !== '') performcolumnfilter = true;

  const performtextfilter = searchtext && searchtext !== '' ? true : false;
  const re = new RegExp(searchtext.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'gi'); // Ensures that all possible regex characters in searchtext are escaped before searching

  return data.filter(
    x =>
      (performcolumnfilter ? isColumnExactMatch(x, columnfilter) : true) &&
      (performtextfilter ? isMatch(x, re) : true) &&
      (customFilter ? customFilter(x) : true)
  );
};

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy, sortComparator) {
  const cmp = sortComparators[sortComparator];
  return cmp && order === 'desc' ? (a, b) => -cmp(a, b, orderBy) : (a, b) => cmp(a, b, orderBy);
}

export function setDefaults(state: TableStore.State, tables: TableStore.Table[]): TableStore.State {
  //If default table doesnt exist in state, then populate the values, then combine state with upated state
  return tables
    .filter(t => !state[t.id])
    .map(t => updateState(state, t))
    .reduce(spread, { ...state });
}

// Store helpers
export function updateState(state: TableStore.State, table: TableStore.Table) {
  var newState = { ...state };
  newState[table.id] = table;
  if (state && state[table.id]) {
    //If table already exists, keep any other existing props
    newState[table.id] = {
      ...state[table.id],
      ...table
    };
  }
  return newState;
}

export const isObject = obj => typeof obj === 'object';
export const isObjectWithKeys = obj => isObject(obj) && Object.keys(obj).length > 0;
