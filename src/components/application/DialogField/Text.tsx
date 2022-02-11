import * as React from 'react';
import { TextField } from '@mui/material';
import { isError } from '../../../helpers';

const Text = ({ value = '', forceErrorMargin = false, error = undefined, initialValue = undefined, ...other }) => (
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
);

export default Text;
