import * as React from 'react';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { TextField } from '@mui/material';
import MuiDateTimePicker from '@mui/lab/DateTimePicker';
import { isError } from '../../../helpers';

const DateTimePicker = ({ onChange, value, error, getTime = false, forceErrorMargin = false, ...other }) => {
  const handleChange = React.useCallback(
    (value: any) => {
      onChange({ target: { value: getTime && value ? value.getTime() : value } });
    },
    [getTime, onChange]
  );
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MuiDateTimePicker
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

export default DateTimePicker;
