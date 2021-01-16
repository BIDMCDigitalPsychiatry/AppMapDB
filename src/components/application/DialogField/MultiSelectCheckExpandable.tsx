import * as React from 'react';
import { Box, Collapse, Grid, Typography } from '@material-ui/core';
import Check from './Check';
import { bool } from '../../../helpers';

export default function MuliSelectCheckExpandable({
  value = [],
  onChange = undefined,
  label = undefined,
  placeholder = undefined,
  fullWidth = true,
  disabled = false,
  size = 'small' as 'small',
  items = [],
  disableCloseOnSelect = true,
  initialValue = undefined, // prevent passing down
  InputProps = undefined,
  ...other
}) {
  const [expand, setExpand] = React.useState(false);
  const handleChange = React.useCallback(
    (itemValue, value) => e => {
      const checked = e.target.value;
      console.log({ itemValue, value, checked });
      const newValue = value.filter(v => v !== itemValue);
      if (!bool(checked)) {
        onChange && onChange({ target: { value: newValue } });
      } else {
        onChange && onChange({ target: { value: newValue.concat(itemValue) } });
      }
    },
    [onChange]
  );

  return (
    <>
      <Typography onClick={() => setExpand(!expand)}>{label}</Typography>
      <Box ml={1}>
        <Grid>
          <Collapse in={expand}>
            {items.map(i => (
              <Grid item>
                <Check
                  label={i.label}
                  color='primary'
                  margin='none'
                  value={value.find(v => v === i.value) ? true : false}
                  onChange={handleChange(i.value, value)}
                />
              </Grid>
            ))}
          </Collapse>
        </Grid>
      </Box>
    </>
  );
}
