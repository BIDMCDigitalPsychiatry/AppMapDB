import * as React from 'react';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio as MuiRadio,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import { isError } from '../../../helpers';

const Radio = ({
  items,
  label,
  variant,
  error,
  margin = 'dense' as 'dense',
  onChange,
  forceErrorMargin,
  initialValue = undefined,
  ...other
}) => (
  <FormControl component='fieldset' variant={variant} error={isError(error)} fullWidth margin={margin}>
    <Typography color='textSecondary'>{label}</Typography>
    <RadioGroup onChange={onChange} {...other}>
      {items.map(i => (
        <FormControlLabel key={i.value} value={i.value} control={<MuiRadio />} label={i.label} />
      ))}
    </RadioGroup>
    {(forceErrorMargin || error) && <FormHelperText>{error}</FormHelperText>}
  </FormControl>
);

export default Radio;
