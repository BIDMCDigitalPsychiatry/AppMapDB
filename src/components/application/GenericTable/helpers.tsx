import { AppState } from '../../../store';
import { GenericTableContainerProps } from './GenericTableContainer';
import * as TableStore from './store';
import { isEmpty, spread } from '../../../helpers';
import Decimal from 'decimal.js-light';
import { questions } from '../../pwa/questions';

///////////////////////////////////////////
/////////////// Table Sorters  ////////////
//////////////////////////////////////////

export type SortComparator = 'text' | 'textLower' | 'decimal' | 'featureMatchCount' | 'anyMatchCount';
const sortComparators = {
  text: desc,
  textLower: lowerDesc,
  decimal: descDecimal,
  featureMatchCount: featureMatchCount,
  anyMatchCount: anyMatchCount
};

///////////////////////////////////////////
/////////////// Table Filters ////////////
//////////////////////////////////////////

export interface ColumnFilter {
  value: string | boolean;
  column: string;
}

export const escapeRegex = searchtext => new RegExp(searchtext.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'gi'); // Ensures that all possible regex characters in searchtext are escaped before searching

export const isMatch = (obj, re) => {
  if (obj.getSearchValues) {
    return obj.getSearchValues().match(re);
  } else {
    for (var attrname in obj) {
      if (['_id', 'id', 'key', 'getValues', 'getSearchValues', 'edit', 'action'].includes(attrname.toLowerCase())) continue;
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
  var searchtext = table?.searchtext;

  const columnfilter = table &&
    table.columnfiltervalue != null &&
    table.columnfiltercolumn != null && {
      value: table && table.columnfiltervalue,
      column: table && table.columnfiltercolumn
    };

  const filtered = table_filter(data, columnfilter, searchtext, customFilter);
  return table && table.orderBy ? stableSort(filtered, getSorting(table.orderDirection, table.orderBy, table.sortComparator)) : filtered;
};

export const useTableFilter = (data: any, name: string, customFilter = undefined, fuzzyFilter = undefined, mode = undefined) => {
  //Extract the table information from the redux store
  const table = TableStore.useTable(name);
  const searchtext = table?.searchtext;

  const columnfilter = table &&
    table.columnfiltervalue != null &&
    table.columnfiltercolumn != null && {
      value: table && table.columnfiltervalue,
      column: table && table.columnfiltercolumn
    };

  const filtered = table_filter(data, columnfilter, searchtext, customFilter, fuzzyFilter);
  if (mode === 'pwa') {
    // For PWA, the features filter should be OR inclusive and sorted by most feature matches first
    return stableSort(filtered, getSorting('desc', table.filters, 'anyMatchCount'));
  } else {
    return table && table.orderBy ? stableSort(filtered, getSorting(table.orderDirection, table.orderBy, table.sortComparator)) : filtered;
  }
};

export const table_filter = (data, columnfilter: ColumnFilter, searchtext = '', customFilter = undefined, fuzzyFilter = undefined) => {
  var performcolumnfilter = false;
  if (columnfilter) if (columnfilter.column) if (columnfilter.value !== 'All' && columnfilter.value !== '') performcolumnfilter = true;

  const performtextfilter = searchtext && searchtext !== '' ? true : false;

  const re = escapeRegex(searchtext);

  const filtered = data.filter(
    x =>
      (performcolumnfilter ? isColumnExactMatch(x, columnfilter) : true) &&
      (performtextfilter ? isMatch(x, re) : true) &&
      (customFilter ? customFilter(x, searchtext) : true)
  );

  if (fuzzyFilter) {
    return fuzzyFilter(data, filtered, searchtext, customFilter);
  } else {
    return filtered;
  }
};

export function lowerDesc(a, b, orderBy) {
  var aTxt = !isEmpty(a[orderBy]) ? a[orderBy].toLowerCase() : a[orderBy];
  var bTxt = !isEmpty(b[orderBy]) ? b[orderBy].toLowerCase() : b[orderBy];
  if (bTxt < aTxt) {
    return -1;
  }
  if (bTxt > aTxt) {
    return 1;
  }
  return 0;
}

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function descDecimal(a, b, orderBy) {
  const A = a?.getValues();
  const B = b?.getValues();
  var dA = new Decimal(A[orderBy] ?? 0);
  var dB = new Decimal(B[orderBy] ?? 0);
  if (dB.lessThan(dA)) {
    return -1;
  }
  if (dB.greaterThan(dA)) {
    return 1;
  }
  return 0;
}

export const getPwaFilterMatchCount = ({ filters, app }) => {
  var count = 0;
  questions.forEach(({ id, appKey }) => {
    var filterValues = filters[id];
    //console.log({ id, filterValues, appKey, filters });
    if (Array.isArray(filterValues) && filterValues?.length > 0) {
      filterValues.forEach(f => {
        if (app[appKey] && app[appKey].length && app[appKey].find(v => v === f)) {
          count = count + 1;
        }
      });
    }
  });
  return count;
};

function anyMatchCount(a, b, orderBy) {
  const A = a?.getValues();
  const B = b?.getValues();

  var mA = 0;
  var mB = 0;

  questions.forEach(({ id, appKey }) => {
    var filterValues = orderBy[id];
    if (Array.isArray(filterValues) && filterValues?.length > 0) {
      // orderBy contains the current table filters
      // Compare this to the number of matches for each row
      filterValues.forEach(f => {
        if (A[appKey] && A[appKey].length && A[appKey].find(v => v === f)) {
          mA = mA + 1;
        }
        if (B[appKey] && B[appKey].length && B[appKey].find(v => v === f)) {
          mB = mB + 1;
        }
      });
    }
  });

  if (mA > 0 || mB > 0) {
    console.log({ orderBy, mA, mB });
  }

  if (mB < mA) {
    return 1;
  }
  if (mB > mA) {
    return -1;
  }
  return 0;
}

function featureMatchCount(a, b, orderBy) {
  const A = a?.getValues();
  const B = b?.getValues();
  // orderBy = filters
  // Match a.features to filter

  if (Array.isArray(orderBy) && orderBy.length > 0) {
    // orderBy contains the current table filters for the Feature column
    // Compare this to the number of matches for each row
    var mA = 0;
    var mB = 0;
    //console.log({ A, a });
    orderBy.forEach(f => {
      if (A.features && A.features?.length && A.features.find(af => af === f)) {
        mA = mA + 1;
      }
      if (B.features && B.features?.length && B.features.find(bf => bf === f)) {
        mB = mB + 1;
      }
    });
    if (mA > 0 || mB > 0) {
      console.log({ orderBy, mA, mB });
    }

    if (mB < mA) {
      return 1;
    }
    if (mB > mA) {
      return -1;
    }
    return 0;
  } else {
    return 0;
  }
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

export const isFunction = f => typeof f === 'function';
export const isObject = obj => typeof obj === 'object';
export const isObjectWithKeys = obj => isObject(obj) && Object.keys(obj).length > 0;
