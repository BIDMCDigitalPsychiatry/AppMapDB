import * as React from 'react';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { isError } from '../../../helpers';

const DatePicker = ({ onChange, value, error, forceErrorMargin = false, ...other }) => {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        fullWidth={true}
        margin='dense'
        inputVariant='outlined'
        format='MM/dd/yyyy'
        KeyboardButtonProps={{
          'aria-label': 'change date'
        }}
        value={value}
        onChange={React.useCallback(
          (e, value) => {
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

export default DatePicker;
