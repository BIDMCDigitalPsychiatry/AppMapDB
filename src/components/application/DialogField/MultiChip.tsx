import * as React from 'react';
import MultiChipSelect from './MultiChipSelect';

// This converts the chip items to an array of string values
const removeFormatDefault = event => {
  event.target.value = event.target.value.map(i => i.value);
  return event;
};

const addFormatDefault = (value = [], items) => {
  return items.filter(i => value.find(i2 => i2 === i.value));
};

const MultiChip = ({
  value = [],
  items,
  variant = 'outlined',
  addFormat = addFormatDefault,
  removeFormat = removeFormatDefault,
  onChange = undefined,
  ...other
}) => {
  const handleChange = React.useCallback(e => onChange && onChange(removeFormat(e)), [onChange, removeFormat]);
  return <MultiChipSelect value={addFormat(value, items)} onChange={handleChange} variant={variant} items={items} {...other} />;
};

export default MultiChip;
