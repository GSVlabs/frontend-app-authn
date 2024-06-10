import React from 'react';

import PropTypes from 'prop-types';

import { FormFieldRenderer } from '../field-renderer';

const CustomFormFields = ({ formFieldsData, onChangeHandler, values }) => {
  const priorityOrder = ['organization_type', 'is_organization_registered', 'organization_size'];

  const sortedFormFieldsData = [...formFieldsData].sort((a, b) => {
    const priorityA = priorityOrder.indexOf(a.name);
    const priorityB = priorityOrder.indexOf(b.name);
    return priorityA - priorityB;
  });

  return (
    <>
      {sortedFormFieldsData.map((fieldData) => (
        <span key={fieldData.name} id={fieldData.name}>
          <FormFieldRenderer
            fieldData={fieldData}
            value={values[fieldData.name]}
            onChangeHandler={onChangeHandler}
            errorMessage={fieldData.error_message}
          />
        </span>
      ))}
    </>
  );
};

CustomFormFields.propTypes = {
  values: PropTypes.oneOfType(PropTypes.string),
  formFieldsData: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      label: PropTypes.string,
      error_message: PropTypes.string,
      type: PropTypes.string,
    }),
  ),
  onChangeHandler: PropTypes.func,
};

CustomFormFields.defaultProps = {
  values: {},
  formFieldsData: [],
  onChangeHandler: () => {},
};

export default CustomFormFields;
