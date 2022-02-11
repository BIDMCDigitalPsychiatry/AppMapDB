import * as React from 'react';
import { isError } from '../../../helpers';
import MuiDatePicker from '@mui/lab/DatePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { TextField } from '@mui/material';

const DatePicker = ({ onChange, value, error, forceErrorMargin = false, ...other }) => {
  const handleChange = React.useCallback(
    value => {
      onChange({ target: { value } });
    },
    [onChange]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MuiDatePicker
        inputFormat='MM/dd/yyyy'
        value={value}
        onChange={handleChange}
        renderInput={({ error: iError, helperText: iHelperText, ...remaining }) => (
          <TextField
            error={isError(error) || iError}
            helperText={forceErrorMargin ? (error ?? iHelperText) || ' ' : (error ?? iHelperText) && (error ?? iHelperText)} // Forces a constant helper text margin
            fullWidth={true}
            margin='dense'
            variant='outlined'
            {...(remaining as any)}
          />
        )}
        {...other}
      />
    </LocalizationProvider>
  );
};

export default DatePicker;
