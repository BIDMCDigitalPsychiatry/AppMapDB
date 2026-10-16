import * as React from 'react';
import { Box, FormControl, FormControlLabel, FormHelperText, Radio as MuiRadio, RadioGroup, Typography } from '@mui/material';
import { isError } from '../../../helpers';
import OutlinedDiv from '../../general/OutlinedDiv/OutlinedDiv';
import { useT } from '../../../i18n';

const RadioRow = ({
  items,
  value = '',
  label,
  variant,
  error,
  margin = 'dense' as 'dense',
  onChange,
  forceErrorMargin,
  initialValue = undefined,
  disabled = false,
  ...other
}) => {
  const t = useT();
  return (
    <FormControl component='fieldset' variant={variant} error={isError(error)} fullWidth margin={margin} disabled={disabled}>
      <Box mb={1}>
        <Typography variant='body2'>{t(label)}</Typography>
      </Box>
      <OutlinedDiv>
        <RadioGroup row onChange={onChange} value={value} {...other}>
          {items.map(i => (
            <FormControlLabel key={i.value} value={i.value} control={<MuiRadio size='small' />} label={<Typography variant='body2'>{t(i.label)}</Typography>} />
          ))}
        </RadioGroup>
        {(forceErrorMargin || error) && <FormHelperText>{t(error)}</FormHelperText>}
      </OutlinedDiv>
    </FormControl>
  );
};

export default RadioRow;
