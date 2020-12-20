import * as React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
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
  size = 'small' as 'small',
  items = [],
  disableCloseOnSelect = true,
  initialValue = undefined, // prevent passing down
  InputProps = undefined,
  ...other
}) {
  const handleChange = React.useCallback((e, value = []) => onChange && onChange({ target: { value: value.map(i => i.value) } }), [onChange]);

  return (
    <Autocomplete
      size='small'
      multiple
      options={items}
      disableCloseOnSelect={disableCloseOnSelect}
      getOptionLabel={option => option.label}
      renderOption={(option, { selected }) => (
        <>
          <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
          {option.label}
        </>
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
