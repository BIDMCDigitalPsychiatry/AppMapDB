import React from 'react';
import { FormControl, InputLabel, Select, FormHelperText } from '@material-ui/core';
import { setIfEmpty, isError } from '../../../helpers';

export interface ComponentProps {
  label?: string;
  value?: any;
  margin?: any;
  forceErrorMargin?: boolean;
  children?: any;
}

const OutlinedSelect = ({
  label,
  variant = 'outlined',
  value,
  error,
  required,
  margin = 'dense',
  forceErrorMargin = true,
  children,
  ...other
}: ComponentProps & any) => {
  const inputLabel = React.useRef<HTMLLabelElement>(null);
  const [labelWidth, setLabelWidth] = React.useState(0);

  React.useEffect(() => {
    setLabelWidth(inputLabel.current!.offsetWidth);
  }, [inputLabel]);

  return (
    <FormControl variant={variant} required={required} error={isError(error)} fullWidth margin={margin}>
      <InputLabel ref={inputLabel} shrink={true}>
        {label}
      </InputLabel>
      <Select notched={true} labelWidth={labelWidth} value={setIfEmpty(value)} {...other}>
        {children}
      </Select>
      {(forceErrorMargin || error) && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export default OutlinedSelect;
