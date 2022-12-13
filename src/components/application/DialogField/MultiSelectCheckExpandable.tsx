import * as React from 'react';
import { Box, Collapse, Grid, IconButton, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Check from './Check';
import { bool } from '../../../helpers';
import * as Icons from '@mui/icons-material';

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    container: {
      '&:hover': {
        background: palette.grey[100]
      }
    }
  })
);

export default function MuliSelectCheckExpandable({ value = [], onChange = undefined, label = undefined, items = [], color = undefined }) {
  const classes = useStyles();
  const [expand, setExpand] = React.useState(value.length > 0 ? true : false);
  const handleChange = React.useCallback(
    (itemValue, value) => e => {
      const checked = e.target.value;
      const newValue = value.filter(v => v !== itemValue);
      if (!bool(checked)) {
        onChange && onChange(newValue, e);
      } else {
        onChange && onChange(newValue.concat(itemValue), e);
      }
    },
    [onChange]
  );

  const handleClick = React.useCallback(
    e => {
      e.stopPropagation();
      setExpand(!expand);
    },
    [expand, setExpand, onChange]
  );

  const handleClearableClick = React.useCallback(
    e => {
      e.stopPropagation();
      if (expand) {
        onChange && onChange([], e); // Don't clear options on close
      }
      setExpand(!expand);
    },
    [expand, setExpand, onChange]
  );

  const Icon = !expand ? Icons.AddBox : value.length > 0 ? Icons.Clear : Icons.IndeterminateCheckBox;

  return (
    <Box ml={1} mr={1} style={{ paddingBottom: 8 }}>
      <Grid container justifyContent='space-between' alignItems='center' className={classes.container} style={{ cursor: 'pointer' }} onClick={handleClick}>
        <Grid item xs zeroMinWidth={true}>
          <Typography variant='body1' style={{ color, fontWeight: 600 }}>
            {label}
          </Typography>
        </Grid>
        <Grid item>
          <IconButton size='small' onClick={handleClearableClick}>
            <Icon style={{ color }} />
          </IconButton>
        </Grid>
      </Grid>
      <Box ml={1} mr={1}>
        <Grid container>
          <Collapse in={expand}>
            {items.map((i, index) => (
              <Grid key={index} item>
                <Check
                  label={(<Typography variant='body2'>{i.label}</Typography>) as any}
                  style={{ color }}
                  margin='none'
                  value={value.find(v => v === i.value) ? true : false}
                  onChange={handleChange(i.value, value)}
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
