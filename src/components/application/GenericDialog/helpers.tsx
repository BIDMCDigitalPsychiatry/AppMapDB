import React from 'react';
import { getLabel, checkEmpty, hasChanged, validateHttpUrl } from '../../../helpers';
import merge from 'deepmerge';
import { validateEmail, emptyUndefined } from '../../../helpers';
import { isObjectWithKeys } from '../GenericTable/helpers';

export interface FieldProps {
  id: string | number;
  label: string;
  type: string;
  Field?: Element;
  getValue?: (f: FieldProps, values: any) => any;
}

// Mappings to retreive the value from the state
const getMappedValue = (id, object, container, values = {}) => {
  if (container && object) {
    return values[container] && values[container][object] && values[container][object][id];
  } else if (container) {
    return values[container] && values[container][id];
  } else if (object) {
    return values[object] && values[object][id];
  } else {
    return values[id];
  }
};

export const setMappedValue = ({ field, value, prev }) => {
  const { id, object, container } = field;
  if (container && !prev[container]) {
    prev[container] = {};
  }
  if (container && object && !prev[container][object]) {
    prev[container][object] = {};
  }
  if (!container && object && !prev[object]) {
    prev[object] = {};
  }

  if (container && object) {
    prev[container][object][id] = value;
  } else if (container) {
    prev[container][id] = value;
  } else if (object) {
    prev[object][id] = value;
  } else {
    prev[id] = value;
  }
  return prev;
};

const singleValue = ({ id, object, container }, values) => getMappedValue(id, object, container, values);
export const getValue = (f, values) => (f.getValue ? f.getValue(f, values) : singleValue(f, values));

export const isDisabled = (f, values) => (typeof f.disabled === 'function' ? f.disabled(values, f) : f.disabled); //Disabled fields are shown but disabled
export const isActive = ({ active }, values) => (typeof active === 'function' ? active(values) : active); //Active fields are hidden, but can be shown via other options changing in the dialog
export const isHidden = ({ hidden }, values) => (typeof hidden === 'function' ? hidden(values) : hidden); //Hidden fields are hidden for the current dialog state, and can't be shown via other options

export const bindField = ({ f, values, initialValues, errors, touched, handleChange, handleBlur, submitting, showErrors = false }) => {
  const { required, type, autoFocus, InputProps, inputProps, step, min, max, tab, multiline, rows, getProps, disableCloseOnSelect, description } = f; // Only pass necessary props to field
  const props = {
    autoFocus,
    required,
    type,
    value: getValue(f, values),
    initialValue: getValue(f, initialValues),
    error: (showErrors || f.showError) && getValue(f, errors),
    label: getLabel(f),
    disabled: isDisabled(f, values) || submitting,
    onChange: handleChange(f),
    onBlur: handleBlur(f),
    items: f.filter ? f.filter(f.items, values) : typeof f.items === 'function' ? f.items(values) : f.items,
    InputProps,
    inputProps,
    step,
    min,
    max,
    tab,
    multiline,
    rows,
    disableCloseOnSelect,
    description,
    ...(getProps && getProps(values)) // Allows the field to hook into the internal state values if needed
  };
  Object.keys(props).forEach(key => props[key] === undefined && delete props[key]); // Filter out any undefined props so they don't override any previously specified values
  return props;
};

export const isEnabled = value => value === true || value === undefined;

export const useHandleChange = (setValues, resetErrors = undefined) =>
  React.useCallback(
    field => e => {
      var value = e && e.target && e.target.value;
      if (field && field.uppercase && !checkEmpty(value)) {
        value = value.toUpperCase();
      }
      setValues(prev => setMappedValue({ field, value, prev: { ...prev } })); // Ensure prev is a new copy
      resetErrors && resetErrors();
      field.onChange && field.onChange({ value, field, setValues });
    },
    [setValues, resetErrors]
  );

export const getDefaultValues = fields => {
  const defaultValues = {};
  fields.forEach(field => {
    field.initialValue !== undefined &&
      setMappedValue({
        field,
        value: field.initialValue,
        prev: defaultValues
      });
  });
  return defaultValues;
};

export const useValues = ({
  open,
  fields = [],
  InitialValues = {},
  state = {} as any,
  setState,
  validate,
  externalValues = undefined, // Use with externalSetValues, for having an external state, such as redux
  externalSetValues = undefined, //Use with externalValues, for having an external state, such as redux
  onChange = undefined,
  disableInitialize = false
}) => {
  const { initialValues = {}, submitting, showErrors } = state;
  const defaultValues = getDefaultValues(fields); // Get any default values from the individual fields first
  var mergedInitialValues = merge(defaultValues, InitialValues); // Merge with any incoming initialValues from the properties
  mergedInitialValues = merge(mergedInitialValues, initialValues); // Merge any initial values from the external dialog state
  const [internalValues, setInternalValues] = React.useState(mergedInitialValues);
  const values = externalValues ? externalValues : internalValues;

  const setValues = React.useCallback(
    vals => {
      externalSetValues ? externalSetValues(vals) : setInternalValues(vals);
      onChange && onChange(vals);
    },
    [externalSetValues, setInternalValues, onChange]
  );

  const [touched, setTouched] = React.useState({});

  const mergedInitialValuesStr = JSON.stringify(mergedInitialValues); // Use a string since the object references will change everytime
  const initializeValues = React.useCallback(() => {
    setTouched({});
    setValues(JSON.parse(mergedInitialValuesStr));
  }, [setValues, mergedInitialValuesStr]);

  React.useEffect(() => {
    // Re-initialize values when necessary
    open && !disableInitialize && setValues(JSON.parse(mergedInitialValuesStr));
    open && !disableInitialize && setTouched({});
  }, [open, mergedInitialValuesStr, disableInitialize, setValues]);

  const internalErrors = open ? handleValidation({ values, fields, errors: state.errors }) : {}; // Perform standard field validations, required, email, etc
  const externalErrors = open && validate ? validate(values, state) : {}; // Add any external validations if specified
  const errors = merge(internalErrors, externalErrors);
  const errorCount = fields ? fields.filter(f => isError(f, values, errors)).length : 0;

  const stateErrors = state.errors;
  const resetErrors = React.useCallback(() => isObjectWithKeys(stateErrors) && setState(prev => ({ ...prev, errors: {} })), [setState, stateErrors]); // Reset any external errors
  const handleChange = useHandleChange(setValues, resetErrors);
  const handleBlur = React.useCallback(
    field => () => {
      setTouched(prev => setMappedValue({ field, value: true, prev: { ...prev } })); // Ensure new copy of prev is used
    },
    [setTouched]
  );

  const mapField = f =>
    bindField({
      f,
      values,
      initialValues: mergedInitialValues,
      errors,
      touched,
      handleChange,
      handleBlur,
      submitting,
      showErrors
    });

  return {
    values,
    setValues,
    hasChanged: hasChanged(values, mergedInitialValues),
    touched,
    errors,
    errorCount,
    handleChange,
    handleBlur,
    mapField,
    initializeValues
  };
};

export const handleValidation = ({ values, fields, errors: Errors }) => {
  var errors = { ...Errors }; // Make a copy
  fields.forEach(f => {
    if (f.email && !checkEmpty(getValue(f, values)) && !validateEmail(getValue(f, values))) {
      setMappedValue({ field: f, value: 'Invalid email format.', prev: errors });
    } else if (f.required && checkEmpty(getValue(f, values))) {
      setMappedValue({ field: f, value: 'Required', prev: errors });
    } else if (f.http && !checkEmpty(getValue(f, values)) && !validateHttpUrl(getValue(f, values))) {
      setMappedValue({ field: f, value: 'Invalid http url format.', prev: errors });
    } else if (f.validate) {
      setMappedValue({ field: f, value: emptyUndefined(f.validate(values)), prev: errors });
    }
  });

  return errors;
};

// Only count errors for active fields that are not disabled or hidden
export const isError = (field, values, errors) => {
  return (
    !(isActive(field, values) === false) && // Active
    !(isDisabled(field, values) === true) && // Not disabled
    !(isHidden(field, values) === true) && // Not hidden
    getValue(field, errors) !== undefined // Not undefined
  );
};

// Returns a static field array to prevent un-necessary re-renders
export const useStepFields = steps => {
  const [fields, setFields] = React.useState(
    steps
      .filter(s => s.fields)
      .map(s => s.fields)
      .reduce((t, c) => (t = [...t, ...c]), [])
  );

  React.useEffect(() => {
    setFields(
      steps
        .filter(s => s.fields)
        .map(s => s.fields)
        .reduce((t, c) => (t = [...t, ...c]), [])
    );
  }, [steps, setFields]);
  return fields;
};
