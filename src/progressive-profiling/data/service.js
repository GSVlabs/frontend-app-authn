import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

// eslint-disable-next-line import/prefer-default-export
export async function patchAccount(username, commitValues) {
  const requestConfig = {
    headers: { 'Content-Type': 'application/merge-patch+json' },
  };

  await getAuthenticatedHttpClient()
    .patch(
      `${getConfig().LMS_BASE_URL}/api/user/v1/accounts/${username}`,
      commitValues,
      requestConfig,
    )
    .catch((error) => {
      throw (error);
    });
}

export async function saveOrganization(commitValues) {
  const requestConfig = {
    headers: { 'Content-Type': 'application/json' },
  };

  await getAuthenticatedHttpClient()
    .post(
      `${getConfig().LMS_BASE_URL}/onboarding/save-organization/`,
      commitValues,
      requestConfig,
    )
    .catch((error) => {
      throw (error);
    });
}

export async function getOrganizations(query) {
  const requestConfig = {
    headers: { 'Content-Type': 'application/json' },
  };

  return getAuthenticatedHttpClient()
    .get(
      `${getConfig().LMS_BASE_URL}/onboarding/get-organizations/?query=${query}`,
      requestConfig,
    )
    .then(response => {
      if (response.status !== 200) {
        throw new Error(`Failed to fetch organizations: ${response.status}`);
      }
      return response.data;
    })
    .catch((error) => {
      throw (error);
    });
}

export async function getOrganization(id) {
  const requestConfig = {
    headers: { 'Content-Type': 'application/json' },
  };

  return getAuthenticatedHttpClient()
    .get(
      `${getConfig().LMS_BASE_URL}/onboarding/organization/?id=${id}`,
      requestConfig,
    )
    .then(response => {
      if (response.status !== 200) {
        throw new Error(`Failed to fetch organizations: ${response.status}`);
      }
      return response.data;
    })
    .catch((error) => {
      throw (error);
    });
}
