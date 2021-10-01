import * as React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Text from './Text';

const getLabel = option => ((typeof option === 'object' && option ? option.label : option) ?? '').toString();
const getValue = option => (typeof option === 'object' && option ? option.value : option) ?? '';
const getSelectedOption = (value, options) =>
  Array.isArray(options) ? options.find(o => (typeof o === 'object' ? o.value === value : o === value)) ?? '' : '';

// Accepts either an option array of strings, numbers, or { value, label } objects. Reports only the value (not the object) to parent onChange
export default function AutoCompleteSelect({
  items: options = [],
  value = '',
  onChange = undefined,
  disabled = false,
  size = 'small' as 'small',
  freeSolo = true,
  ...other
}) {
  const handleChange = React.useCallback(
    (e, option) => {
      onChange && onChange({ target: { value: getValue(option) } }); // Inject value to mimic behavior of other input on change events
    },
    [onChange]
  );

  return (
    <Autocomplete
      disabled={disabled}
      value={getSelectedOption(value, options)} // convert value to ption
      options={options}
      autoHighlight
      getOptionLabel={option => getLabel(option)}
      renderOption={option => getLabel(option)}
      onChange={handleChange}
      renderInput={params => (
        <Text
          {...params}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password' // disable autocomplete and autofill
          }}
          InputLabelProps={{
            shrink: true
          }}
          disabled={disabled}
          {...other}
        />
      )}
    />
  );
}
