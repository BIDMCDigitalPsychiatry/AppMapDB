import * as React from 'react';
import { MuiPickersUtilsProvider, KeyboardDateTimePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { isError } from '../../../helpers';

const DateTimePicker = ({ onChange, value, error, forceErrorMargin = false, ...other }) => {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDateTimePicker
        fullWidth={true}
        margin='dense'
        inputVariant='outlined'
        KeyboardButtonProps={{
          'aria-label': 'change date'
        }}
        value={value}
        onChange={React.useCallback(
          value => {
            onChange({ target: { value } });
          },
          [onChange]
        )}
        error={isError(error)}
        helperText={forceErrorMargin ? error || ' ' : error && error} // Forces a constant helper text margin
        {...other}
      />
    </MuiPickersUtilsProvider>
  );
};

export default DateTimePicker;
