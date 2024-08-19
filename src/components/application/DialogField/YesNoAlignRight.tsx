import * as React from 'react';
import { FormControl, FormHelperText, Grid, Typography, ButtonGroup, Button } from '@mui/material';
import { isError, isTrue, isFalse } from '../../../helpers';

const YesNoAlignRight = ({
  label = '',
  variant = undefined,
  size = 'small' as 'small',
  color = 'info' as 'info',
  error = undefined,
  value = undefined,
  margin = 'dense' as 'dense',
  onChange = undefined,
  forceErrorMargin = false,
  type = undefined, // Don't pass an undefined type to Checkbox.  This filters the prop out
  initialValue = undefined,
  ...other
}) => {
  const handleChange = React.useCallback(value => () => onChange && onChange({ target: { value } }), [onChange]);
  return (
    <FormControl variant={variant} error={isError(error)} fullWidth={true} margin={margin}>
      <Grid container justifyContent='space-between' alignItems='center' spacing={2}>
        <Grid item xs>
          <Typography variant='body2'>{label}</Typography>
        </Grid>
        <Grid item>
          <ButtonGroup size={size} sx={{ color: 'white' }} aria-label={`${label}-button-group`} {...other}>
            <Button
              sx={{
                backgroundColor: isTrue(value) ? 'primary.dark' : 'white',
                color: isTrue(value) ? 'white' : 'text.secondary',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white'
                }
              }}
              variant={isTrue(value) ? 'contained' : undefined}
              onClick={handleChange(true)}
            >
              Yes
            </Button>
            <Button
              sx={{
                backgroundColor: isFalse(value) ? 'primary.dark' : 'white',
                color: isFalse(value) ? 'white' : 'text.secondary',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white'
                }
              }}
              variant={isFalse(value) ? 'contained' : undefined}
              onClick={handleChange(false)}
            >
              No
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
      {(forceErrorMargin || error) && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export default YesNoAlignRight;
