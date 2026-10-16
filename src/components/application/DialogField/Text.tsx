import * as React from 'react';
import { TextField } from '@mui/material';
import { isError } from '../../../helpers';
import { useT } from '../../../i18n';

const Text = ({ value = '', forceErrorMargin = false, error = undefined, initialValue = undefined, label = undefined, placeholder = undefined, helperText = undefined, ...other }) => {
  const t = useT();
  return (
    <TextField
      value={value}
      error={isError(error)}
      helperText={forceErrorMargin ? t(error) || ' ' : t(error)} // Forces a constant helper text margin
      margin='dense'
      variant='outlined'
      fullWidth
      InputLabelProps={{
        shrink: true
      }}
      {...(label !== undefined ? { label: t(label) } : {})}
      {...(placeholder !== undefined ? { placeholder: t(placeholder) } : {})}
      {...(helperText !== undefined ? { helperText: t(helperText) } : {})}
      {...other}
    />
  );
};

export default Text;
