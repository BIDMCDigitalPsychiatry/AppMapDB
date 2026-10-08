import * as React from 'react';
import { isError } from '../../../helpers';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers'
import { TextField } from '@mui/material';

const DatePicker = ({ onChange, value, error, getTime = false, forceErrorMargin = false, ...other }) => {
  const handleChange = React.useCallback(
    (value: any) => {
      onChange({ target: { value: getTime && value ? value.getTime() : value } });
    },
    [getTime, onChange]
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
