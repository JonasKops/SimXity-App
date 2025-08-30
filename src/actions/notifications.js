import Types from './types';

export const saveNotifications = list => ({
  type: Types.SAVE_NOTIFICATIONS,
  list,
});

export const setEnableNotifications = enable => ({
  type: Types.SET_ENABLE_NOTIFICATIONS,
  enable,
});

export const setTimeShowPopup = timeShowPopup => ({
  type: Types.SET_TIME_SHOW_POPUP,
  timeShowPopup,
});

export const setLastIDNotifications = lastID => ({
  type: Types.SET_LAST_ID_NOTIFICATIONS,
  lastID,
});

export const resetNotifications = () => ({
  type: Types.RESET_NOTIFICATIONS,
});
