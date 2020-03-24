import * as React from 'react';
import { FormControl, FormHelperText, Grid, Typography, ButtonGroup, Button } from '@material-ui/core';
import { isError, isTrue, isFalse } from '../../../helpers';

const YesNo = ({
  label = '',
  variant = undefined,
  key = undefined,
  size = 'small' as 'small',
  color = 'primary' as 'primary',
  error = undefined,
  value = undefined,
  margin = 'dense' as 'dense',
  labelPlacement = 'start',
  onChange = undefined,
  forceErrorMargin = false,
  type = undefined, // Don't pass an undefined type to Checkbox.  This filters the prop out
  initialValue = undefined,
  ...other
}) => {
  const handleChange = React.useCallback(value => () => onChange && onChange({ target: { value, key: key ? key : label } }), [onChange]);

  const Label = (
    <Grid item>
      <Typography variant='body2'>{label}</Typography>
    </Grid>
  );

  return (
    <FormControl key={key ? key : label} variant={variant} error={isError(error)} fullWidth margin={margin}>
      <Grid container justify='space-between' alignItems='center' spacing={3}>
        {labelPlacement === 'start' && Label}
        <Grid item>
          <ButtonGroup size={size} color={color} aria-label={`${label}-button-group`} {...other}>
            <Button variant={isTrue(value) ? 'contained' : undefined} onClick={handleChange(true)}>
              Yes
            </Button>
            <Button variant={isFalse(value) ? 'contained' : undefined} onClick={handleChange(false)}>
              No
            </Button>
          </ButtonGroup>
        </Grid>
        {labelPlacement === 'end' && Label}
      </Grid>
      {(forceErrorMargin || error) && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export default YesNo;
