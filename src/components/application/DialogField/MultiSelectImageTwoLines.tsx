import * as React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import OutlinedDivActive from '../../general/OutlinedDiv/OutlinedDivActive';

const useStyles = makeStyles(() =>
  createStyles({
    img: {
      width: 92,
      height: 92
    }
  })
);

export default function MultiSelectImageTwoLines({
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
    <Grid container alignItems='center' justifyContent='center' spacing={2}>
      {items.map(b => {
        const active = value.findIndex(v => v === b.value) > -1;
        return (
          <Grid item key={b.value} style={{ width: 236, cursor: 'pointer' }} onClick={handleChange(b.value, active)}>
            <OutlinedDivActive active={active}>
              <Grid container style={{ minHeight: 36 }} justifyContent='center' alignItems='center'>
                {b.image && (
                  <Grid item style={{ textAlign: 'center', padding: 8, height: 120 }}>
                    <img draggable='false' className={classes.img} src={b.image} alt={b.label} />
                  </Grid>
                )}
                <Grid item xs={12} alignContent='center'>
                  <Box p={1} sx={{ minHeight: 64 }}>
                    <Typography variant='h6' align='center'>
                      {b.label}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </OutlinedDivActive>
          </Grid>
        );
      })}
    </Grid>
  );
}
