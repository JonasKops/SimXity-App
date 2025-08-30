import Types from '../actions/types';

const INITIAL_STATE = {
  airports: [],
  badges: [],
  timestamp: null,
};

const pilot = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case Types.SET_PILOT_DATA:
      delete action.type;
      return {
        ...state,
        ...action.data,
        timestamp: Date.now(),
      };
    case Types.ADD_PILOT_AIRPORT: {
      const code = (action.code || '').trim().toUpperCase();
      if (!code) return state;
      if ((state.airports || []).includes(code)) return state;
      return {
        ...state,
        airports: [...(state.airports || []), code],
        timestamp: Date.now(),
      };
    }
    case Types.ADD_PILOT_BADGE: {
      const badge = action.badge;
      if (!badge || !badge.id) return state;
      if ((state.badges || []).find(b => b.id === badge.id)) return state;
      return {
        ...state,
        badges: [...(state.badges || []), badge],
        timestamp: Date.now(),
      };
    }
    case Types.CLEAR_PILOT_DATA:
      return INITIAL_STATE;
    default:
      return state;
  }
};

export default pilot;
