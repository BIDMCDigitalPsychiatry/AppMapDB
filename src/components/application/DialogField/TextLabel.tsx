import * as React from 'react';
import { TextField, Typography } from '@mui/material';
import { isError } from '../../../helpers';
import { useT } from '../../../i18n';

export default function TextLabel({ value = '', label, forceErrorMargin = false, error = undefined, initialValue = undefined, placeholder = undefined, helperText = undefined, ...other }) {
  const t = useT();
  return (
    <>
      {label && <Typography variant='body2'>{t(label)}</Typography>}
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
        {...(placeholder !== undefined ? { placeholder: t(placeholder) } : {})}
        {...(helperText !== undefined ? { helperText: t(helperText) } : {})}
        {...other}
      />
    </>
  );
}
