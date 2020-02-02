import * as React from 'react';
import NumberFormat from 'react-number-format';
import Text from './Text';
import { checkEmpty, isDefined } from '../../../helpers';

const checkMinMax = (min, max, value) =>
  !checkEmpty(value)
    ? isDefined(min) && Number(value) < Number(min)
      ? min
      : isDefined(max) && Number(value) > Number(max)
      ? max
      : value
    : value;

function WholeNumberFormat({ inputRef, onChange, min, max, thousandSeparator = undefined, ...other }) {
  return (
    <NumberFormat
      getInputRef={inputRef}
      onValueChange={values => {
        onChange({
          target: {
            value: checkMinMax(min, max, values.value),
          },
        });
      }}
      decimalScale={0}
      allowNegative={false}
      thousandSeparator={thousandSeparator}
      isNumericString
      {...other}
    />
  );
}

export default function WholeNumber({
  InputProps = undefined,
  inputProps = undefined,
  min,
  max,
  thousandSeparator = undefined,
  ...other
}) {
  return (
    <Text
      InputProps={{
        inputComponent: WholeNumberFormat,
        ...InputProps,
      }}
      inputProps={{
        min,
        max,
        thousandSeparator,
        ...inputProps,
      }}
      {...other}
    />
  );
}
