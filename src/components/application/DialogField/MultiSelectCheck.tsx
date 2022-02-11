import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import Text from './Text';

const icon = <CheckBoxOutlineBlankIcon fontSize='small' />;
const checkedIcon = <CheckBoxIcon fontSize='small' />;

export default function MuliSelectCheck({
  value = [],
  onChange = undefined,
  label = undefined,
  placeholder = undefined,
  fullWidth = true,
  disabled = false,
  size = 'small' as any,
  items = [],
  disableCloseOnSelect = true,
  initialValue = undefined, // prevent passing down
  InputProps = undefined,
  ...other
}) {
  const handleChange = React.useCallback((e, value = []) => onChange && onChange({ target: { value: value.map(i => i.value) } }), [onChange]);

  return (
    <Autocomplete
      size={size}
      multiple
      options={items}
      disableCloseOnSelect={disableCloseOnSelect}
      getOptionLabel={option => option.label}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
          {option.label}
        </li>
      )}
      renderInput={params => (
        <Text
          {...params}
          label={label}
          placeholder={placeholder}
          fullWidth={fullWidth}
          InputProps={{ ...params?.InputProps, ...InputProps }}
          InputLabelProps={{
            shrink: true
          }}
          {...other}
        />
      )}
      disabled={disabled}
      value={items.filter(i => value.includes(i.value))}
      onChange={handleChange}
      {...other}
    />
  );
}
