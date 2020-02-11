// Sets the state based on action.id.  If action.payload is a function, then it is called with the previous props as a parameter
function updateState(state, { table, id, payload }) {
  const data = typeof payload === 'function' ? payload(state[table] ? state[table][id] : undefined) : payload;
  var newState = { ...state };
  if (!newState[table]) {
    newState[table] = { id: data };
  } else {
    newState[table][id] = data;
  }
  if (state && state[table] && state[table][id]) {
    newState[table][id] = data;
  }
  return newState;
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
