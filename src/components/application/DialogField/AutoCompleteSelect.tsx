import * as React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Text from './Text';
import { Box } from '@mui/material';

const getLabel = option => ((typeof option === 'object' && option ? option.label : option) ?? '').toString();
const getValue = option => (typeof option === 'object' && option ? option.value : option) ?? '';
const getSelectedOption = (value, options) =>
  Array.isArray(options) ? options.find(o => (typeof o === 'object' ? o.value === value : o === value)) ?? '' : '';

// Accepts either an option array of strings, numbers, or { value, label } objects. Reports only the value (not the object) to parent onChange
export default function AutoCompleteSelect({
  items: options = [],
  value = '',
  onChange,
  disabled = false,
  size = 'small' as 'small',
  freeSolo = undefined,
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
      freeSolo={freeSolo}
      autoHighlight
      getOptionLabel={option => getLabel(option)}
      disabled={disabled}
      value={getSelectedOption(value, options)} // convert value to option
      options={options}
      renderOption={(props, option) => (
        <Box component='li' {...props}>
          {getLabel(option)}
        </Box>
      )}
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
