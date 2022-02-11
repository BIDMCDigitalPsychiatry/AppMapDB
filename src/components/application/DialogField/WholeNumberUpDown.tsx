import * as React from 'react';
import { Grid, IconButton } from '@mui/material';
import WholeNumber from '../../application/DialogField/WholeNumber';
import * as Icons from '@mui/icons-material';

const WholeNumberUpDown = ({
  value = undefined,
  min = undefined,
  max = undefined,
  step = 1,
  disabled = false,
  onChange = undefined,
  InputProps = undefined,
  ...other
}) => {
  const handleUp = React.useCallback(() => {
    if (!isNaN(step)) {
      if (!isNaN(value)) {
        // Value is a number
        if (max !== undefined && !isNaN(max)) {
          if (Number(value) + Number(step) <= Number(max)) {
            onChange && onChange({ target: { value: Number(value) + Number(step) } });
          } else {
            onChange && onChange({ target: { value: min } });
          }
        } else {
          onChange && onChange({ target: { value: Number(value) + Number(step) } });
        }
      } else {
        // Value is not a number
        if (!isNaN(min)) {
          onChange && onChange({ target: { value: min } }); // Set to minimum if value is undefined
        } else {
          onChange && onChange({ target: { value: 0 } }); // Default to 0 if no min is specified
        }
      }
    }
  }, [value, max, min, step, onChange]);
  
  const handleDown = React.useCallback(() => {
    if (!isNaN(step)) {
      if (!isNaN(value)) {
        // Value is a number
        if (min !== undefined && !isNaN(min)) {
          if (Number(value) - Number(step) >= Number(min)) {
            onChange && onChange({ target: { value: Number(value) - Number(step) } });
          } else {
            onChange && onChange({ target: { value: max } });
          }
        } else {
          onChange && onChange({ target: { value: Number(value) - Number(step) } });
        }
      } else {
        // Value is not a number
        if (!isNaN(min)) {
          onChange && onChange({ target: { value: min } }); // Set to minimum if value is undefined
        } else {
          onChange && onChange({ target: { value: 0 } }); // Default to 0 if no min is specified
        }
      }
    }
  }, [value, min, max, step, onChange]);

  return (
    <WholeNumber
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onChange={onChange}
      value={value}
      InputProps={{
        ...InputProps,
        endAdornment: (
          <>
            {InputProps && InputProps.endAdornment}
            <Grid container style={{ width: 18, marginRight: -4 }}>
              <Grid item xs={12}>
                <IconButton disabled={disabled} aria-label='up' style={{ marginTop: -2, marginBottom: -2 }} size='small' onClick={handleUp}>
                  <Icons.ArrowDropUp fontSize='inherit' />
                </IconButton>
              </Grid>
              <Grid item xs={12}>
                <IconButton aria-label='down' style={{ marginTop: -2, marginBottom: -2 }} size='small' disabled={disabled} onClick={handleDown}>
                  <Icons.ArrowDropDown fontSize='inherit' />
                </IconButton>
              </Grid>
            </Grid>
          </>
        )
      }}
      {...other}
    />
  );
};

export default WholeNumberUpDown;
