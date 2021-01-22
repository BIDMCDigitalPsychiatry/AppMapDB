import * as React from 'react';
import { Box, Collapse, createStyles, Grid, IconButton, makeStyles, Typography } from '@material-ui/core';
import Check from './Check';
import { bool } from '../../../helpers';
import * as Icons from '@material-ui/icons';

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    container: {
      '&:hover': {
        background: palette.grey[100]
      }
    }
  })
);

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
  color = undefined,
  ...other
}) {
  const classes = useStyles();
  const [expand, setExpand] = React.useState(value.length > 0 ? true : false);
  const handleChange = React.useCallback(
    (itemValue, value) => e => {
      const checked = e.target.value;
      const newValue = value.filter(v => v !== itemValue);
      if (!bool(checked)) {
        onChange && onChange({ target: { value: newValue } });
      } else {
        onChange && onChange({ target: { value: newValue.concat(itemValue) } });
      }
    },
    [onChange]
  );

  const handleClick = React.useCallback(
    e => {
      e.stopPropagation();
      if (expand) {
        onChange && onChange({ target: { value: [] } });
      }
      setExpand(!expand);
    },
    [expand, setExpand, onChange]
  );

  const Icon = !expand ? Icons.AddBox : value.length > 0 ? Icons.Clear : Icons.IndeterminateCheckBox;

  return (
    <Box ml={1} mr={1} style={{ paddingBottom: 8 }}>
      <Grid container justify='space-between' alignItems='center' className={classes.container} style={{ cursor: 'pointer' }} onClick={handleClick}>
        <Grid item xs zeroMinWidth={true}>
          <Typography variant='body1' style={{ color, fontWeight: 500 }}>
            {label}
          </Typography>
        </Grid>
        <Grid item>
          <IconButton size='small'>
            <Icon style={{ color }} />
          </IconButton>
        </Grid>
      </Grid>
      <Box ml={1} mr={1}>
        <Grid container>
          <Collapse in={expand}>
            {items.map(i => (
              <Grid item>
                <Check
                  label={(<Typography variant='body2'>{i.label}</Typography>) as any}
                  style={{ color }}
                  margin='none'
                  value={value.find(v => v === i.value) ? true : false}
                  onChange={handleChange(i.value, value)}
                  color={color}
                  size='small'
                />
              </Grid>
            ))}
          </Collapse>
        </Grid>
      </Box>
    </Box>
  );
}
