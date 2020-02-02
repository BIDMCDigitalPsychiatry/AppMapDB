import * as React from 'react';
import { MenuItem } from '@material-ui/core';
import OutlinedSelect from '../../general/OutlinedSelect/OutlinedSelect';

// If using multi select, the value must be the item so the === operator works for determining selected items.
const Select = ({
  items = [],
  multiple = false,
  variant = 'outlined',
  forceErrorMargin = false,
  initialValue = undefined,
  ...other
}) => (
  <OutlinedSelect variant={variant} multiple={multiple} forceErrorMargin={forceErrorMargin} {...other}>
    {items.map(item => (
      <MenuItem key={item.value} value={multiple ? item : item.value}>
        {item.label}
      </MenuItem>
    ))}
  </OutlinedSelect>
);

export default Select;
