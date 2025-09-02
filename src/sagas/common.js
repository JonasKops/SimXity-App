/**
 * @flow
 */

import { put } from 'redux-saga/effects';
import { ProgressBar } from 'app-component';
import { setLoading } from '../actions/common';

// eslint-disable-next-line import/prefer-default-export
export function* showLoading(actions) {
  const { loading, isNative } = actions.data;

  // Debug trace: timestamp, loading flag and a short stack to locate caller
  try {
    const ts = new Date().toISOString();
    const stack = (new Error().stack || '').split('\n').slice(2, 8).join('\n');
    // Keep logs concise
    console.log(`[showLoading] ${ts} loading=${loading} isNative=${isNative}\n${stack}`);
  } catch (e) {
    // ignore logging errors
  }

  if (isNative) {
    // eslint-disable-next-line no-unused-expressions
    loading
      ? ProgressBar.Circle.showSpinIndeterminate()
      : ProgressBar.Circle.dismiss();
    return;
  }

  yield put(setLoading(loading));
}
