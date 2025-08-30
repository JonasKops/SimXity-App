import Types from '../actions/types';

const INITIAL_STATE = {
  language: 'en',
};
const language = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case Types.SAVE_LANGUAGE:
      delete action.type;
      return {
        ...state,
        language: action.language,
        action,
      };

    default:
      return state;
  }
};

export default language;
