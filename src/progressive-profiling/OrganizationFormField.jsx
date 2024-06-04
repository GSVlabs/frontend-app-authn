import React, {
  useCallback,
  useEffect, useMemo,
  useRef,
} from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@edx/paragon';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/async';

import { getOrganizations } from './data/service';
import messages from './messages';

const OrganizationFormField = (props) => {
  const { formatMessage } = useIntl();
  const currentRequestRef = useRef('');
  const selectRef = useRef(null);

  const {
    valueOrgField,
    onChangeHandler,
    setOrgId,
    onShowCustomFormFields,
    onSelecteOrganizationHandler,
    setOptions,
    options,
    formErrors,
    optionsMenuOpen,
    setOptionsMenuOpen,
  } = props;

  useEffect(() => {
    if (!valueOrgField) {
      setOptions([]);
    }
  }, [valueOrgField, setOptions]);

  useEffect(() => {
    if (!valueOrgField && selectRef.current) {
      selectRef.current.blur();
    }
  }, [valueOrgField]);

  const delayedGetOrganizations = useMemo(
    () => debounce((name, callback) => {
      getOrganizations(name).then(results => {
        if (currentRequestRef.current !== name) {
          // If the current request does not match the latest query, do not update the state
          return;
        }
        let transformedResults = Object.keys(results).map(key => {
          const org = results[key];
          return {
            value: org.id,
            nameOrg: org.label,
            label: (
              <span style={{ fontSize: '14px' }}>
                {org.label}
                <span style={{ color: '#888', marginLeft: '8px' }}>
                  {org.country}
                </span>
              </span>
            ),
          };
        });

        if (transformedResults.length > 0) {
          const informativeOption = {
            value: null,
            nameOrg: null,
            label: <span className="organization-select-info">{formatMessage(messages['organization.select.info'])}</span>,
            isDisabled: true,
          };
          transformedResults = [informativeOption, ...transformedResults];
        }
        setOptions(transformedResults);
        callback(transformedResults);
      });
    }, 600),
    [formatMessage, setOptions],
  );

  const getOrganizationsCallback = useCallback(
    (...args) => {
      delayedGetOrganizations(...args);
    },
    [delayedGetOrganizations],
  );

  const loadOptions = (inputValue, callback) => {
    const updatedName = inputValue.trim();
    currentRequestRef.current = updatedName;
    if (updatedName?.length > 1) {
      getOrganizationsCallback(updatedName, callback);
      onShowCustomFormFields(true);
      setOptionsMenuOpen(true);
    } else {
      callback([]);
      onShowCustomFormFields(false);
      setOptionsMenuOpen(false);
      setOptions([]);
    }
  };

  const handleInputChange = (newValue, actionMeta) => {
    if (actionMeta.action === 'input-change') {
      setOrgId(null);
      onChangeHandler({ target: { name: 'organization', value: newValue.trim() } });
    }
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      height: 44,
      borderColor: state.isFocused ? '#61b4e4' : '#707070',
      boxShadow: state.isFocused ? '0 0 0 1px #61b4e4' : 'none',
      fontSize: 14,
      '&:hover': {
        borderColor: '#707070',
      },
    }),
  };

  return (
    <div className="mb-4">
      <Form.Label className="mb-3" isInline>{formatMessage(messages['welcome.page.organization.description'])}</Form.Label>
      <AsyncSelect
        ref={selectRef}
        placeholder={formatMessage(messages['welcome.page.organization.name'])}
        defaultOptions={options}
        isOptionDisabled={(option) => option.isDisabled}
        value={valueOrgField ? { value: valueOrgField, label: valueOrgField } : null}
        loadOptions={loadOptions}
        onInputChange={handleInputChange}
        onChange={onSelecteOrganizationHandler}
        menuIsOpen={optionsMenuOpen && options?.length > 0}
        onMenuOpen={() => setOptionsMenuOpen(true)}
        onMenuClose={() => setOptionsMenuOpen(false)}
        isClearable
        escapeClearsValue
        styles={customStyles}
      />
      {formErrors?.name && (
        <div className="text-danger mt-2" style={{ fontSize: '0.7em' }}>
          {formErrors?.name}
        </div>
      )}
    </div>
  );
};

OrganizationFormField.propTypes = {
  valueOrgField: PropTypes.string,
  options: PropTypes.oneOfType(PropTypes.string),
  formErrors: PropTypes.oneOfType(PropTypes.string),
  optionsMenuOpen: PropTypes.bool,
  setOptionsMenuOpen: PropTypes.func,
  onChangeHandler: PropTypes.func,
  setOrgId: PropTypes.func,
  setOptions: PropTypes.func,
  onShowCustomFormFields: PropTypes.func,
  onSelecteOrganizationHandler: PropTypes.func,
};

OrganizationFormField.defaultProps = {
  valueOrgField: '',
  options: [],
  formErrors: {},
  optionsMenuOpen: {},
  setOptionsMenuOpen: () => {},
  onChangeHandler: () => {},
  setOrgId: () => {},
  setOptions: () => {},
  onShowCustomFormFields: () => {},
  onSelecteOrganizationHandler: () => {},
};

export default OrganizationFormField;
