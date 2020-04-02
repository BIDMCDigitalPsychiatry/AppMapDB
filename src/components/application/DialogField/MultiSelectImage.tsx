import * as React from 'react';
import { Grid, Box, Typography, makeStyles, createStyles } from '@material-ui/core';
import OutlinedDivActive from '../../general/OutlinedDiv/OutlinedDivActive';

const useStyles = makeStyles(() =>
  createStyles({
    img: {
      width: 92,
      height: 92
    }
  })
);

export default function MultiSelectImage({
  value = [],
  onChange = undefined,
  label,
  placeholder,
  fullWidth = true,
  disabled = false,
  size = 'small' as 'small',
  items = [],
  disableCloseOnSelect = true,
  initialValue = undefined, // prevent passing down
  replace = false,
  ...other
}) {
  const classes = useStyles({});
  const handleChange = React.useCallback(
    (val, exists) => () => {
      const newValue = replace ? [val] : exists ? value.filter(v => v !== val) : [...value, val];
      onChange && onChange({ target: { value: newValue } });
    },
    [onChange, value, replace]
  );

  return (
    <Grid container item xs={12} justify='center' spacing={2}>
      {items.map(b => {
        const active = value.findIndex(v => v === b.value) > -1;
        return (
          <Grid item key={b.value} style={{ cursor: 'pointer' }} onClick={handleChange(b.value, active)}>
            <OutlinedDivActive active={active}>
              {b.image && (
                <Box width={150} height={120}>
                  <Box p={1}>
                    <Typography align='center'>
                      <img draggable='false' className={classes.img} src={b.image} alt={b.label} />
                    </Typography>
                  </Box>
                </Box>
              )}
              <Box pb={b.image ? 1 : 0}>
                <Typography variant='h6' align='center'>
                  {b.label}
                </Typography>
              </Box>
            </OutlinedDivActive>
          </Grid>
        );
      })}
    </Grid>
  );
}
