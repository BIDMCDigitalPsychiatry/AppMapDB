const initialState = {};

// Sets the state based on action.id.  If action.payload is a function, then it is called with the previous props as a parameter
function updateState(state, action) {
  const { table, id, payload } = action;
  const data = typeof payload === 'function' ? payload(state[table] ? state[table][id] : undefined) : action.payload;
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

export default function dialogReducer(state = initialState, action) {
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
