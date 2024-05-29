import { call, put, takeEvery } from 'redux-saga/effects';

import {
  SAVE_ORGANIZATION,
  SAVE_USER_PROFILE,
  saveOrganizationBegin,
  saveOrganizationFailure,
  saveOrganizationSuccess,
  saveUserProfileBegin,
  saveUserProfileFailure,
  saveUserProfileSuccess,
} from './actions';
import { patchAccount, saveOrganization } from './service';

export function* saveUserProfileInformation(action) {
  try {
    yield put(saveUserProfileBegin());
    yield call(patchAccount, action.payload.username, action.payload.data);

    yield put(saveUserProfileSuccess());
  } catch (e) {
    yield put(saveUserProfileFailure());
  }
}

export function* saveOrganizationInformation(action) {
  try {
    yield put(saveOrganizationBegin());
    yield call(saveOrganization, action.payload.data);

    yield put(saveOrganizationSuccess());
  } catch (e) {
    yield put(saveOrganizationFailure());
  }
}

export default function* saga() {
  yield takeEvery(SAVE_ORGANIZATION.BASE, saveOrganizationInformation);
  yield takeEvery(SAVE_USER_PROFILE.BASE, saveUserProfileInformation);
}
