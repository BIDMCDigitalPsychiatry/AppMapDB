import * as React from 'react';
import { Switch as MuiSwitch, FormControlLabel } from '@material-ui/core';
import { bool } from '../../../helpers';

export default function Switch({ value = undefined, forceErrorMargin = false, error = undefined, getFieldState = undefined, label = '', onChange = undefined, ...other }) {
  const handleChange = React.useCallback(
    (event, value) => {
      onChange && onChange({ target: { value } });
    },
    [onChange]
  );

  return (
    <FormControlLabel control={<MuiSwitch color='primary' onChange={handleChange} checked={bool(value)} {...other} />} label={label} labelPlacement='start' />
  );
}
