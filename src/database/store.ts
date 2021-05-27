import { isEmpty, onlyUnique, sortAscendingToLower } from '../helpers';

// Inserts or updates item payload with table and id keys.  If action.payload is a function, then it is called with the previous props as a parameter
function updateState(state, { table, id, payload }) {
  const data = typeof payload === 'function' ? payload(state[table] ? state[table][id] : undefined) : payload;

  if (!state[table]) {
    // Table doesn't exist.  Create new table with the associated entry.
    return { ...state, [table]: { [id]: data } };
  } else if (state[table] && !state[table][id]) {
    // Table exists but item dies not.  Insert item at beginning of table.
    return { ...state, [table]: { [id]: data, ...state[table] } };
  } else {
    // Table exists and item exists.  Update item at it's current position.
    const newState = { ...state };
    newState[table][id] = data;
    return newState;
  }
}

const initialState = {};

export const updateDatabase = (table, id, payload) => ({ type: 'UPDATE_DATABASE', table, id, payload });
export const setDatabaseTable = (table, payload) => ({ type: 'SET_DATABASE_TABLE', table, payload });
export const exportDatabase = (table, ids) => ({ type: 'EXPORT_DATABASE', table, ids });

export const saveCsv = csv => {
  const fileName = `export_${Date.now()}.csv`;
  let link = document.createElement('a');
  link.id = 'download-csv';
  link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  var node = document.querySelector('#download-csv') as any;
  node && node.click();
};

const exportDatabaseCsv = (state, table, ids) => {
  var csv = '';
  var columns = [];
  // First get a list of all the columns, so we can correctly export everyhting in a consistent manner
  ids.forEach((id, index) => {
    const row = state[table][id];
    columns = [...columns, ...Object.keys(row)];
  });
  columns = columns.filter(onlyUnique).sort(sortAscendingToLower); // Unique and sorted column names;

  ids.forEach((id, index) => {
    if (index === 0 && columns.length > 0) {
      csv = columns.map(c => `"${c ?? ''}"`).join(',') + '\r\n'; // Output columns to first row
    }
    const row = state[table][id];
    csv =
      csv +
      columns
        .map(column => {
          var cell = (typeof (row[column] === 'object') ? JSON.stringify(row[column]) : row[column]) ?? '';
          const formatted = isEmpty(cell) ? cell : cell.replace(/["]+/g, ''); // Remove all double quotes
          return isEmpty(cell) ? '""' : `"${formatted}"`; // Wrap all values in double quotes to support commas within value
        })
        .join(',') +
      '\r\n'; // Output row/column data, include double quotes around content for correct csv handling when content contains linebreaks, commas, etc
  });
  saveCsv(csv);
};

export const exportTableCsv = (data, columns) => {  
  var csv = '';
  data.forEach((row, i) => {
    if (i === 0) {
      csv += columns.map(({ name }) => `"${name ?? ''}"`).join(',') + '\r\n'; // Output columns to first row
    }

    var rowData = row.getExportValues ? row.getExportValues() : row;

    csv +=
      columns
        .map(({ name }) => {
          var cell = (typeof (rowData[name] === 'object') ? JSON.stringify(rowData[name]) : rowData[name]) ?? '';
          const formatted = isEmpty(cell) ? cell : cell.replace(/["]+/g, ''); // Remove all double quotes
          return isEmpty(cell) ? '""' : `"${formatted}"`; // Wrap all values in double quotes to support commas within value
        })
        .join(',') + '\r\n';
  });
  saveCsv(csv);
};

export function reducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_DATABASE_TABLE':
      var newState = { ...state };
      newState[action.table] = action.payload;
      return newState;
    case 'UPDATE_DATABASE':
      return updateState(state, action);
    case 'EXPORT_DATABASE':
      exportDatabaseCsv(state, action.table, action.ids);
      return state;
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}
