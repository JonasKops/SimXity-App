import Types from '../actions/types';

const INITIAL_STATE = {
  enable: true,
  timeShowPopup: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
  list: [],
  lastID: 0,
};

const notifications = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case Types.SAVE_NOTIFICATIONS:
      delete action.type;
      return {
        ...state,
        list: action.list,
      };
    case Types.SET_TIME_SHOW_POPUP:
      delete action.type;
      return {
        ...state,
        timeShowPopup: action.timeShowPopup,
      };
    case Types.SET_ENABLE_NOTIFICATIONS:
      delete action.type;
      return {
        ...state,
        enable: action.enable,
      };
    case Types.SET_LAST_ID_NOTIFICATIONS:
      delete action.type;
      return {
        ...state,
        lastID: action.lastID,
      };
    case Types.RESET_NOTIFICATIONS:
      delete action.type;
      return INITIAL_STATE;

    default:
      return state;
  }
};

export default notifications;
