import * as React from 'react';
import { Switch as MuiSwitch, FormControlLabel } from '@mui/material';
import { bool } from '../../../helpers';
import { useT } from '../../../i18n';

export default function Switch({ value = undefined, forceErrorMargin = false, error = undefined, getFieldState = undefined, label = '', onChange = undefined, ...other }) {
  const t = useT();
  const handleChange = React.useCallback(
    (event, value) => {
      onChange && onChange({ target: { value } });
    },
    [onChange]
  );

  return (
    <FormControlLabel control={<MuiSwitch color='primary' onChange={handleChange} checked={bool(value)} {...other} />} label={t(label)} labelPlacement='start' />
  );
}
