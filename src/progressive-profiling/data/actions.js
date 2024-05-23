import { AsyncActionType } from '../../data/utils';

export const GET_FIELDS_DATA = new AsyncActionType('FIELD_DESCRIPTION', 'GET_FIELDS_DATA');
export const SAVE_USER_PROFILE = new AsyncActionType('USER_PROFILE', 'SAVE_USER_PROFILE');
export const SAVE_ORGANIZATION = new AsyncActionType('ORGANIZATION', 'SAVE_ORGANIZATION');

// save additional user information
export const saveUserProfile = (username, data) => ({
  type: SAVE_USER_PROFILE.BASE,
  payload: { username, data },
});

export const saveUserProfileBegin = () => ({
  type: SAVE_USER_PROFILE.BEGIN,
});

export const saveUserProfileSuccess = () => ({
  type: SAVE_USER_PROFILE.SUCCESS,
});

export const saveUserProfileFailure = () => ({
  type: SAVE_USER_PROFILE.FAILURE,
});

// save additional organization information
export const saveOrganization = (data) => ({
  type: SAVE_ORGANIZATION.BASE,
  payload: { data },
});

export const saveOrganizationBegin = () => ({
  type: SAVE_ORGANIZATION.BEGIN,
});

export const saveOrganizationSuccess = () => ({
  type: SAVE_ORGANIZATION.SUCCESS,
});

export const saveOrganizationFailure = () => ({
  type: SAVE_ORGANIZATION.FAILURE,
});
