import * as React from 'react';
import { Box, Button, Checkbox, Collapse, Grid, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import * as Icons from '@mui/icons-material';

const useStyles = makeStyles(({ palette, transitions }: any) =>
  createStyles({
    header: {
      cursor: 'pointer',
      borderRadius: 8,
      padding: '6px 8px',
      userSelect: 'none',
      '&:hover': {
        background: palette.grey[100]
      }
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      display: 'inline-block',
      flexShrink: 0
    },
    countPill: {
      minWidth: 22,
      height: 20,
      padding: '0 6px',
      borderRadius: 10,
      color: palette.common.white,
      fontSize: 12,
      fontWeight: 700,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    chevron: {
      color: palette.text.secondary,
      transition: transitions?.create ? transitions.create('transform', { duration: 150 }) : 'transform 150ms',
      transform: 'rotate(0deg)'
    },
    chevronOpen: {
      transform: 'rotate(180deg)'
    },
    optionRow: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      borderRadius: 8,
      padding: '0px 4px',
      cursor: 'pointer',
      '&:hover': {
        background: palette.grey[100]
      }
    },
    optionCount: {
      marginLeft: 'auto',
      paddingLeft: 8,
      color: palette.text.secondary,
      fontSize: 12,
      whiteSpace: 'nowrap'
    },
    clearButton: {
      textTransform: 'none',
      fontWeight: 600,
      minWidth: 0,
      padding: '0 6px'
    }
  })
);

export default function MuliSelectCheckExpandable({ value = [], onChange = undefined, label = undefined, items = [], color = undefined, counts = undefined }) {
  const classes = useStyles();
  const [expand, setExpand] = React.useState(value.length > 0 ? true : false);

  const handleToggleItem = React.useCallback(
    itemValue => e => {
      e.stopPropagation();
      const selected = value.find(v => v === itemValue);
      const newValue = selected ? value.filter(v => v !== itemValue) : value.concat(itemValue);
      onChange && onChange(newValue, e);
    },
    [onChange, value]
  );

  const handleToggleExpand = React.useCallback(() => setExpand(prev => !prev), [setExpand]);

  const handleClear = React.useCallback(
    e => {
      e.stopPropagation();
      onChange && onChange([], e);
    },
    [onChange]
  );

  return (
    <Box ml={1} mr={1} style={{ paddingBottom: 4 }}>
      <Grid container justifyContent='space-between' alignItems='center' wrap='nowrap' className={classes.header} onClick={handleToggleExpand}>
        <Grid item zeroMinWidth xs>
          <Grid container alignItems='center' spacing={1} wrap='nowrap'>
            <Grid item style={{ display: 'flex' }}>
              <span className={classes.dot} style={{ background: color ?? 'grey' }} />
            </Grid>
            <Grid item zeroMinWidth xs>
              <Typography variant='body2' noWrap style={{ fontWeight: 700 }}>
                {label}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {value.length > 0 && (
            <>
              <span className={classes.countPill} style={{ background: color ?? 'grey' }}>
                {value.length}
              </span>
              <Button size='small' className={classes.clearButton} onClick={handleClear} aria-label={`Clear ${label} filters`}>
                Clear
              </Button>
            </>
          )}
          <Icons.ExpandMore fontSize='small' className={`${classes.chevron} ${expand ? classes.chevronOpen : ''}`} />
        </Grid>
      </Grid>
      <Collapse in={expand}>
        <Box ml={0.5} mr={0.5} mb={0.5}>
          {items.map((i, index) => {
            const checked = value.find(v => v === i.value) ? true : false;
            const count = counts?.[i.value];
            return (
              <label key={index} className={classes.optionRow} style={checked ? { background: `${color}14` } : undefined}>
                <Checkbox size='small' checked={checked} onChange={handleToggleItem(i.value)} style={{ color, padding: 4 }} />
                <Typography variant='body2' style={{ lineHeight: 1.3 }}>
                  {i.label}
                </Typography>
                {/* Count = results if this option is selected; hidden once
                    checked (the would-be-unselected count reads as noise). */}
                {!checked && count !== undefined && <span className={classes.optionCount}>{count}</span>}
              </label>
            );
          })}
        </Box>
      </Collapse>
    </Box>
  );
}
