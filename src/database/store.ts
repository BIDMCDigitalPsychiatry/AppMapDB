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

export function reducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_DATABASE_TABLE':
      var newState = { ...state };
      newState[action.table] = action.payload;
      return newState;
    case 'UPDATE_DATABASE':
      return updateState(state, action);
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}
