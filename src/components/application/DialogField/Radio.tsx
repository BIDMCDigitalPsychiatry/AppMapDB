import * as React from 'react';
import { FormControl, FormControlLabel, FormHelperText, Radio as MuiRadio, RadioGroup, Typography } from '@mui/material';
import { isError } from '../../../helpers';
import OutlinedDiv from '../../general/OutlinedDiv/OutlinedDiv';

const Radio = ({ items, value = '', label, variant, error, margin = 'dense' as 'dense', onChange, forceErrorMargin, initialValue = undefined, ...other }) => (
  <FormControl component='fieldset' variant={variant} error={isError(error)} fullWidth margin={margin}>
    <OutlinedDiv label={label}>
      <RadioGroup onChange={onChange} value={value} {...other}>
        {items.map(i => (
          <FormControlLabel key={i.value} value={i.value} control={<MuiRadio size='small' />} label={<Typography variant='body2'>{i.label}</Typography>} />
        ))}
      </RadioGroup>
      {(forceErrorMargin || error) && <FormHelperText>{error}</FormHelperText>}
    </OutlinedDiv>
  </FormControl>
);

export default Radio;
