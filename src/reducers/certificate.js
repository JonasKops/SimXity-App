/* eslint-disable no-param-reassign */
import Types from '../actions/types';

const INITIAL_STATE = {
  certificate: null,
};

const certificate = (state = INITIAL_STATE, action) => {
  switch (action.type) {

    case Types.SAVE_CERTIFICATE:
      delete action.type;
      return {
        ...state,
        certificate: action.certificate,
      };
    default:
      return state;
  }
};

export default certificate;
