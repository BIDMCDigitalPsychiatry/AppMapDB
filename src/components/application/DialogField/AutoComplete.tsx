import * as React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Text from './Text';

export default function AutoComplete({ items: options, value = '', onChange = undefined, size = 'small' as 'small', ...other }) {
  const handleChange = React.useCallback(
    (event, value) => {
      onChange && onChange({ target: { value } }); // Inject value to mimic behavior of other input on change events
    },
    [onChange]
  );

  return (
    <Autocomplete
      freeSolo
      onChange={handleChange}
      size={size}
      value={value}
      options={options}
      renderInput={params => <Text {...params} onChange={onChange} {...other} />}
    />
  );
}
