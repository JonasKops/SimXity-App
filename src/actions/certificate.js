import Types from './types';

export const setCertificate = (certificate: Object) => ({
  type: Types.SAVE_CERTIFICATE,
  certificate,
});

