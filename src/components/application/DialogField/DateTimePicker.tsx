import * as React from 'react';
import { TextField } from '@mui/material';
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { isError } from '../../../helpers';
import { useT } from '../../../i18n';

const DateTimePicker = ({ onChange, value, error, getTime = false, forceErrorMargin = false, label = undefined, ...other }) => {
  const t = useT();
  const handleChange = React.useCallback(
    (value: any) => {
      onChange({ target: { value: getTime && value ? value.getTime() : value } });
    },
    [getTime, onChange]
  );
  return (
    <MuiDateTimePicker
      value={value}
      onChange={handleChange}
      renderInput={({ error: iError, helperText: iHelperText, ...remaining }) => (
        <TextField
          error={isError(error) || iError}
          helperText={forceErrorMargin ? (t(error) ?? iHelperText) || ' ' : (t(error) ?? iHelperText) && (t(error) ?? iHelperText)} // Forces a constant helper text margin
          fullWidth={true}
          margin='dense'
          variant='outlined'
          {...(remaining as any)}
        />
      )}
      label={t(label)}
      {...other}
    />
  );
};

export default DateTimePicker;
