import * as React from 'react';
import MuiRating from '@material-ui/lab/Rating';
import OutlinedDiv from '../../general/OutlinedDiv/OutlinedDiv';
import { FormControl, FormHelperText } from '@material-ui/core';
import { isError } from '../../../helpers';

export default function Rating({
  onChange = undefined,
  label,
  disabled = false,
  size = 'small' as 'small',
  variant = 'outlined',
  forceErrorMargin = false,
  required,
  error,
  value = 0,
  ...other
}) {
  const handleChange = React.useCallback((e, value) => onChange && onChange({ target: { value } }), [onChange]);
  return (
    <FormControl variant={variant as any} required={required} margin='dense' error={isError(error)} fullWidth>
      <OutlinedDiv label={label} error={error}>
        <MuiRating name={label} size={size} precision={0.5} disabled={disabled} onChange={handleChange} {...other} />
      </OutlinedDiv>
      {(forceErrorMargin || error) && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}
