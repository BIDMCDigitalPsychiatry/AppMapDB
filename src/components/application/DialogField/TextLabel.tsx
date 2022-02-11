import * as React from 'react';
import { TextField, Typography } from '@mui/material';
import { isError } from '../../../helpers';

export default function TextLabel({ value = '', label, forceErrorMargin = false, error = undefined, initialValue = undefined, ...other }) {
  return (
    <>
      {label && <Typography variant='body2'>{label}</Typography>}
      <TextField
        value={value}
        error={isError(error)}
        helperText={forceErrorMargin ? error || ' ' : error} // Forces a constant helper text margin
        margin='dense'
        variant='outlined'
        fullWidth
        InputLabelProps={{
          shrink: true
        }}
        {...other}
      />
    </>
  );
}
