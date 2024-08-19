import React from 'react';
import { FormControl, Select as MuiSelect, FormHelperText, MenuItem, Typography } from '@mui/material';
import { isError, setIfEmpty } from '../../../helpers';

export interface ComponentProps {
  label?: string;
  value?: any;
  margin?: any;
  forceErrorMargin?: boolean;
  children?: any;
}

const Select = ({
  label,
  variant = 'outlined',
  value,
  error,
  required,
  margin = 'dense',
  forceErrorMargin = true,
  getFieldState = undefined,
  children,
  items = [],
  multiple = false,
  ...other
}: ComponentProps & any) => {
  const labelId = `select-${label}`;
  return (
    <>
      {label && <Typography variant='body2'>{label}</Typography>}
      <FormControl variant={variant} required={required} error={isError(error)} fullWidth margin={margin}>
        <MuiSelect
          labelId={labelId}
          label={label}
          labelWidth={100}
          value={setIfEmpty(value)}
          size='small'
          {...other}
          sx={{ background: 'white' }}
          notched={false}
        >
          {items.map((item, i) => (
            <MenuItem key={i} value={multiple ? item : item.value}>
              {item.label}
            </MenuItem>
          ))}
        </MuiSelect>
        {(forceErrorMargin || error) && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    </>
  );
};

export default Select;
