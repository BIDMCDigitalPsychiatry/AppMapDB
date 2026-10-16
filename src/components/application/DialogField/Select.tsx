import React from 'react';
import { FormControl, InputLabel, Select as MuiSelect, FormHelperText, MenuItem } from '@mui/material';
import { isError, setIfEmpty } from '../../../helpers';
import { useT } from '../../../i18n';

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
  const t = useT();
  const labelId = `select-${label}`;
  return (
    <FormControl variant={variant} required={required} error={isError(error)} fullWidth margin={margin}>
      <InputLabel id={labelId}>{t(label)}</InputLabel>
      <MuiSelect labelId={labelId} label={t(label)} labelWidth={100} value={setIfEmpty(value)} {...other}>
        {items.map((item, i) => (
          <MenuItem key={i} value={multiple ? item : item.value}>
            {t(item.label)}
          </MenuItem>
        ))}
      </MuiSelect>
      {(forceErrorMargin || error) && <FormHelperText>{t(error)}</FormHelperText>}
    </FormControl>
  );
};

export default Select;
