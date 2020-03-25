import * as React from 'react';
import { FormControl, Box, FormHelperText, Typography, Divider } from '@material-ui/core';
import { isError, isTrue, onlyUnique } from '../../../helpers';
import OutlinedDiv from '../../general/OutlinedDiv/OutlinedDiv';
import YesNo from './YesNo';

const YesNoGroup = ({
  label = '',
  description = undefined,
  items = [],
  variant = undefined,
  size = 'small' as 'small',
  color = 'primary' as 'primary',
  error = undefined,
  forceErrorMargin = false,
  value = '',
  margin = 'dense' as 'dense',
  onChange = undefined,
  ...other
}) => {
  const handleChange = React.useCallback(
    key => event => {
      const itemValue = event.target.value; // true or false
      const values = value.split(',').filter(v => v !== '');
      onChange && onChange({ target: { value: (isTrue(itemValue) ? [...values, key].filter(onlyUnique) : values.filter(v => v !== key)).join(',') } });
    },
    [value, onChange]
  );

  const getValue = key => value.split(',').includes(key);

  return (
    <FormControl variant={variant} error={isError(error)} fullWidth margin={margin}>
      <OutlinedDiv label={label}>
        <Box mt={1} mb={1}>
          {description && (
            <Typography paragraph={true} color='textSecondary' variant='caption'>
              {description}
            </Typography>
          )}
          {items.map(({ label, value: key, ...more }) => (
            <YesNo label={label} key={key} value={getValue(key)} onChange={handleChange(key)} {...other} {...more} />
          ))}
          {(forceErrorMargin || error) && <FormHelperText>{error}</FormHelperText>}
        </Box>
      </OutlinedDiv>
    </FormControl>
  );
};

export default YesNoGroup;
