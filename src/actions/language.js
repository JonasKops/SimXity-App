import Types from './types';

export const setLanguage = lang => ({
  type: Types.SAVE_LANGUAGE,
  language: lang,
});
