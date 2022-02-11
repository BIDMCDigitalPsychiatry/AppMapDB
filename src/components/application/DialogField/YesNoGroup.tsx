import * as React from 'react';
import { FormControl, Box, FormHelperText, Typography } from '@mui/material';
import { isError, isTrue, onlyUnique, evalFunc } from '../../../helpers';
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
  value = [],
  margin = 'dense' as 'dense',
  onChange = undefined,
  ...other
}) => {
  const handleChange = React.useCallback(
    key => event => {
      const itemValue = event.target.value; // true or false
      onChange && onChange({ target: { value: isTrue(itemValue) ? [...value, key].filter(onlyUnique) : value.filter(v => v !== key) } });
    },
    [value, onChange]
  );

  const getValue = key => value.includes(key);

  return (
    <FormControl variant={variant} error={isError(error)} fullWidth margin={margin}>
      <OutlinedDiv label={label}>
        <Box mt={1} mb={1}>
          {description && (
            <Typography paragraph={true} color='textSecondary' variant='caption'>
              {description}
            </Typography>
          )}
          {items
            .filter(i => !evalFunc(i.hidden, value))
            .map(({ label, value: key, ...more }) => (
              <div key={key}>
                <YesNo label={label} value={getValue(key)} onChange={handleChange(key)} {...other} {...more} />
              </div>
            ))}
          {(forceErrorMargin || error) && <FormHelperText>{error}</FormHelperText>}
        </Box>
      </OutlinedDiv>
    </FormControl>
  );
};

export default YesNoGroup;
