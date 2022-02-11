import * as React from 'react';
import { FormControl, FormControlLabel, Checkbox, FormHelperText } from '@mui/material';
import { bool, isError } from '../../../helpers';

const Check = ({
  label = '',
  variant = undefined,
  error = undefined,
  value = undefined,
  margin = 'dense' as any,
  onChange = undefined,
  forceErrorMargin = false,
  type = undefined, // Don't pass an undefined type to Checkbox.  This filters the prop out
  initialValue = undefined,
  ...other
}) => {
  const handleChange = React.useCallback(
    event => {
      event.target.value = event.target.checked === true ? 1 : 0; // Inject checked value to mimic behavior of other input on change events
      onChange && onChange(event);
    },
    [onChange]
  );

  return (
    <FormControl variant={variant} error={isError(error)} fullWidth margin={margin}>
      <FormControlLabel label={label} control={<Checkbox checked={bool(value)} onChange={handleChange} {...other} />} />
      {(forceErrorMargin || error) && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export default Check;
