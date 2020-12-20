import * as React from 'react';
import { Features } from '../../../database/models/Application';
import { Chip, createStyles, emphasize, Grid, makeStyles, Typography } from '@material-ui/core';
import * as Icons from '@material-ui/icons';

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    chip: {
      borderRadius: 10,
      minWidth: 280,
      background: '#5FBA63',
      color: palette.common.white
    },
    colorPrimary: {
      background: palette.primary.dark,
      color: palette.common.white,
      '&:hover, &:focus': {
        backgroundColor: emphasize(palette.primary.dark, 0.08)
      }
    },

    colorSecondary: {
      background: '#5FBA63',
      color: palette.common.white,
      '&:hover, &:focus': {
        backgroundColor: emphasize('#5FBA63', 0.08)
      }
    },
    chipActive: {
      minWidth: 280,
      borderRadius: 10,
      background: palette.primary.primary,
      color: palette.common.white
    }
  })
);

export default function MuliFeatureSelectCheck({
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
  const classes = useStyles();
  const handleChange = React.useCallback(
    (f, isActive = false) => event => {
      var newValue = value.filter(v => v !== f);
      if (!isActive) {
        newValue = newValue.concat(f);
      }

      console.log({ value, newValue, isActive });
      onChange && onChange({ target: { value: newValue } });
    },
    [value, onChange]
  );

  return (
    <Grid container justify='flex-start' spacing={2}>
      {Features.map(f => {
        const isActive = value.find(v => v === f);
        const iconStyle = { color: 'white' };
        const StartIcon = isActive ? Icons.Check : Icons.Add;
        return (
          <Grid item>
            <Chip
              color={isActive ? 'primary' : 'secondary'}
              classes={{ colorPrimary: classes.colorPrimary, colorSecondary: classes.colorSecondary }}
              className={isActive ? classes.chipActive : classes.chip}
              onClick={handleChange(f, isActive)}
              icon={<StartIcon style={iconStyle} />}
              label={<Typography style={{ minWidth: 200 }}>{f}</Typography>}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}
