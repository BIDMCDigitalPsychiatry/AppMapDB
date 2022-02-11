import * as React from 'react';
import { Chip } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Text from './Text';

const AutoCompleteChip = ({ value = [], items: options = [], size = 'small' as 'small', disabled, onChange, ...other }) => {
  const handleChange = React.useCallback(
    (event, value) => {
      onChange && onChange({ target: { value } });
    },
    [onChange]
  );
  return (
    <Autocomplete
      value={value}
      disabled={disabled}
      multiple
      size={size}
      options={options}
      freeSolo
      onChange={handleChange}
      renderTags={(value: string[], getTagProps) =>
        value.map((option: string, index: number) => <Chip disabled={disabled} size={size} label={option} {...getTagProps({ index })} />)
      }
      renderInput={params => <Text {...params} {...other} />}
    />
  );
};

export default AutoCompleteChip;
