import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { identifyAuthenticatedUser, sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  AxiosJwtAuthService,
  configure as configureAuth,
  getAuthenticatedUser,
} from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getLoggingService } from '@edx/frontend-platform/logging';
import {
  Alert,
  Form,
  StatefulButton,
} from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

import CustomFormFields from './CustomFormFields';
import { saveOrganization } from './data/actions';
import { welcomePageContextSelector } from './data/selectors';
import { getOrganization } from './data/service';
import messages from './messages';
import OrganizationFormField from './OrganizationFormField';
import ProgressiveProfilingPageModal from './ProgressiveProfilingPageModal';
import BaseContainer from '../base-container';
import { RedirectLogistration } from '../common-components';
import { getThirdPartyAuthContext } from '../common-components/data/actions';
import {
  COMPLETE_STATE,
  DEFAULT_REDIRECT_URL,
  DEFAULT_STATE,
  FAILURE_STATE,
  PENDING_STATE,
} from '../data/constants';
import isOneTrustFunctionalCookieEnabled from '../data/oneTrust';
import { getAllPossibleQueryParams, isHostAvailableInQueryParams } from '../data/utils';

const ProgressiveProfiling = (props) => {
  const { formatMessage } = useIntl();
  const {
    getFieldDataFromBackend,
    submitState,
    showError,
    welcomePageContext,
    welcomePageContextApiStatus,
  } = props;
  const location = useLocation();
  const registrationEmbedded = isHostAvailableInQueryParams();

  const queryParams = getAllPossibleQueryParams();
  const authenticatedUser = getAuthenticatedUser() || location.state?.authenticatedUser;
  const functionalCookiesConsent = isOneTrustFunctionalCookieEnabled();
  const enablePostRegistrationRecommendations = (
    getConfig().ENABLE_POST_REGISTRATION_RECOMMENDATIONS && functionalCookiesConsent
  );

  const [registrationResult, setRegistrationResult] = useState({ redirectUrl: '' });
  const [formFieldData, setFormFieldData] = useState({ fields: {}, extendedProfile: [] });
  const [values, setValues] = useState({});
  const [orgId, setOrgId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRecommendationsPage, setShowRecommendationsPage] = useState(false);
  const [customFormFields, setCustomFormFields] = useState([]);
  const [showCustomFormFields, setShowCustomFormFields] = useState(false);
  const [options, setOptions] = useState([]);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [formErrors, setFormErrors] = useState(null);

  useEffect(() => {
    if (registrationEmbedded) {
      getFieldDataFromBackend({ is_welcome_page: true, next: queryParams?.next });
    } else {
      configureAuth(AxiosJwtAuthService, { loggingService: getLoggingService(), config: getConfig() });
    }
  }, [registrationEmbedded, getFieldDataFromBackend, queryParams?.next]);

  useEffect(() => {
    const registrationResponse = location.state?.registrationResult;
    if (registrationResponse) {
      setRegistrationResult(registrationResponse);
      setFormFieldData({
        fields: location.state?.optionalFields.fields,
        extendedProfile: location.state?.optionalFields.extended_profile,
      });
    }
  }, [location.state]);

  useEffect(() => {
    if (registrationEmbedded && Object.keys(welcomePageContext).includes('fields')) {
      setFormFieldData({
        fields: welcomePageContext.fields,
        extendedProfile: welcomePageContext.extended_profile,
      });
      const nextUrl = welcomePageContext.nextUrl ? welcomePageContext.nextUrl : getConfig().SEARCH_CATALOG_URL;
      setRegistrationResult({ redirectUrl: nextUrl });
    }
  }, [registrationEmbedded, welcomePageContext]);

  useEffect(() => {
    setFormErrors(null);
  }, [values]);

  useEffect(() => {
    const additionalFields = [];
    Object.keys(formFieldData.fields).forEach((fieldName) => {
      const fieldData = formFieldData.fields[fieldName];
      additionalFields.push(fieldData);
    });
    setCustomFormFields(additionalFields);
  }, [formFieldData]);

  useEffect(() => {
    if (authenticatedUser?.userId) {
      identifyAuthenticatedUser(authenticatedUser.userId);
      sendPageEvent('login_and_registration', 'welcome');
    }
  }, [authenticatedUser]);

  useEffect(() => {
    if (!enablePostRegistrationRecommendations) {
      sendTrackEvent(
        'edx.bi.user.recommendations.not.enabled',
        { functionalCookiesConsent, page: 'authn_recommendations' },
      );
      return;
    }

    if (registrationResult.redirectUrl && authenticatedUser?.userId) {
      const redirectQueryParams = getAllPossibleQueryParams(registrationResult.redirectUrl);
      if (!('enrollment_action' in redirectQueryParams || queryParams?.next)) {
        setShowRecommendationsPage(true);
      }
    }
  }, [
    authenticatedUser,
    enablePostRegistrationRecommendations,
    functionalCookiesConsent,
    registrationResult.redirectUrl,
    queryParams?.next,
  ]);

  if (
    !authenticatedUser
    || !(location.state?.registrationResult || registrationEmbedded)
    || welcomePageContextApiStatus === FAILURE_STATE
    || (welcomePageContextApiStatus === COMPLETE_STATE && !Object.keys(welcomePageContext).includes('fields'))
  ) {
    const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
    global.location.assign(DASHBOARD_URL);
    return null;
  }

  const validateOrganizationName = (name) => {
    const updatedName = name?.trim().toLowerCase();
    const errors = {};
    if (updatedName?.length < 2 || updatedName?.length > 255) {
      errors.name = formatMessage(messages['organization.name.length.error']);
    }
    if (options?.length > 0) {
      options.some(option => {
        if (!option.isDisabled && option?.nameOrg.toLowerCase() === updatedName) {
          errors.name = formatMessage(messages['organization.name.duplicate.error']);
          return true;
        }
        return false;
      });
    }
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    window.history.replaceState(location.state, null, '');
    setOptionsMenuOpen(false);
    if (values?.organization?.length > 0) {
      const orgNameErrors = validateOrganizationName(values?.organization);
      if (Object.keys(orgNameErrors).length > 0) {
        setFormErrors(orgNameErrors);
        return;
      }
    }
    const payload = { ...values, organizationId: orgId };
    props.saveOrganization(snakeCaseObject(payload));

    sendTrackEvent(
      'edx.bi.welcome.page.submit.clicked',
      {
        isSavedOrganization: !!values?.organization,
        host: queryParams?.host || '',
      },
    );
  };

  const handleSkip = (e) => {
    e.preventDefault();
    window.history.replaceState(location.state, null, '');
    setShowModal(true);
    sendTrackEvent(
      'edx.bi.welcome.page.skip.link.clicked',
      {
        host: queryParams?.host || '',
      },
    );
  };

  const onChangeHandler = (event) => {
    if (event) {
      if (event.target.name === 'organization') {
        // In order to clear the state of additional fields when the organization name changes
        setValues({ [event.target.name]: event.target.value });
      } else {
        setValues({ ...values, [event.target.name]: event.target.value });
      }
    } else {
      setValues({});
    }
  };

  const organizationSelectHandler = async (selectedOption) => {
    if (!selectedOption) {
      onChangeHandler({ target: { name: 'organization', value: null } });
      setValues({});
      setOrgId(null);
      setShowCustomFormFields(false);
      return;
    }
    onChangeHandler({ target: { name: 'organization', value: selectedOption.nameOrg } });
    setOrgId(selectedOption.value);
    setOptions([]);
    const results = await getOrganization(selectedOption.value);

    Object.keys(results).forEach(key => {
      const element = document.getElementById(key);
      if (element && results[key] !== null) {
        element.style.display = 'none';
      }
    });
  };

  return (
    <BaseContainer showWelcomeBanner username={authenticatedUser?.username}>
      <Helmet>
        <title>{formatMessage(messages['progressive.profiling.page.title'],
          { siteName: getConfig().SITE_NAME })}
        </title>
      </Helmet>
      <ProgressiveProfilingPageModal isOpen={showModal} redirectUrl={registrationResult.redirectUrl} />
      {(props.shouldRedirect && welcomePageContext.nextUrl) && (
        <RedirectLogistration
          success
          redirectUrl={registrationResult.redirectUrl}
        />
      )}
      {props.shouldRedirect && (
        <RedirectLogistration
          success
          redirectUrl={registrationResult.redirectUrl}
          redirectToRecommendationsPage={showRecommendationsPage}
          educationLevel={values?.level_of_education}
          userId={authenticatedUser?.userId}
        />
      )}
      <div className="mw-xs m-4 pp-page-content">
        <div>
          <h2 className="pp-page__heading text-primary">{formatMessage(messages['progressive.profiling.page.heading'])}</h2>
        </div>
        <hr className="border-light-700 mb-4" />
        {showError ? (
          <Alert id="pp-page-errors" className="mb-3" variant="danger" icon={Error}>
            <Alert.Heading>{formatMessage(messages['welcome.page.error.heading'])}</Alert.Heading>
            <p>{formatMessage(messages['welcome.page.error.message'])}</p>
          </Alert>
        ) : null}
        <Form className="authn-organization-form">
          <OrganizationFormField
            valueOrgField={values?.organization}
            onChangeHandler={onChangeHandler}
            onSetOrgId={setOrgId}
            onShowCustomFormFields={setShowCustomFormFields}
            onSelecteOrganizationHandler={organizationSelectHandler}
            setOptions={setOptions}
            options={options}
            formErrors={formErrors}
            optionsMenuOpen={optionsMenuOpen}
            setOptionsMenuOpen={setOptionsMenuOpen}
          />
          {showCustomFormFields && (
            <CustomFormFields
              formFieldsData={customFormFields}
              onChangeHandler={onChangeHandler}
              values={values}
            />
          )}
          <span className="pp-page__support-link">
            {formatMessage(messages['welcome.page.supporting.information'])}
          </span>
          <div className="d-flex mt-4 mb-3">
            <StatefulButton
              type="submit"
              variant="brand"
              className="pp-page__button-width"
              state={submitState}
              labels={{
                default: showRecommendationsPage ? formatMessage(messages['optional.fields.next.button']) : formatMessage(messages['optional.fields.submit.button']),
                pending: '',
              }}
              onClick={handleSubmit}
              onMouseDown={(e) => e.preventDefault()}
            />
            <StatefulButton
              className="text-gray-700 font-weight-500"
              type="submit"
              variant="link"
              labels={{
                default: formatMessage(messages['optional.fields.skip.button']),
              }}
              onClick={handleSkip}
              onMouseDown={(e) => e.preventDefault()}
            />
          </div>
        </Form>
      </div>
    </BaseContainer>
  );
};

ProgressiveProfiling.propTypes = {
  authenticatedUser: PropTypes.shape({
    username: PropTypes.string,
    userId: PropTypes.number,
  }),
  showError: PropTypes.bool,
  shouldRedirect: PropTypes.bool,
  submitState: PropTypes.string,
  welcomePageContext: PropTypes.shape({
    extended_profile: PropTypes.arrayOf(PropTypes.string),
    fields: PropTypes.shape({}),
    nextUrl: PropTypes.string,
  }),
  welcomePageContextApiStatus: PropTypes.string,
  // Actions
  getFieldDataFromBackend: PropTypes.func.isRequired,
  saveOrganization: PropTypes.func.isRequired,
};

ProgressiveProfiling.defaultProps = {
  authenticatedUser: {},
  shouldRedirect: false,
  showError: false,
  submitState: DEFAULT_STATE,
  welcomePageContext: {},
  welcomePageContextApiStatus: PENDING_STATE,
};

const mapStateToProps = state => {
  const welcomePageStore = state.welcomePage;

  return {
    shouldRedirect: welcomePageStore.success,
    showError: welcomePageStore.showError,
    submitState: welcomePageStore.submitState,
    welcomePageContext: welcomePageContextSelector(state),
    welcomePageContextApiStatus: state.commonComponents.thirdPartyAuthApiStatus,
  };
};

export default connect(
  mapStateToProps,
  {
    saveOrganization,
    getFieldDataFromBackend: getThirdPartyAuthContext,
  },
)(ProgressiveProfiling);
