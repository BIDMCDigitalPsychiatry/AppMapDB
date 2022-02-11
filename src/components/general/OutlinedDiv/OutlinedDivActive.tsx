import React from 'react';
import { Grid, InputLabel } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import NotchedOutline from '@mui/material/OutlinedInput/NotchedOutline';
import { isError } from '../../../helpers';

const useStyles = makeStyles(({ palette, shadows }: any) =>
  createStyles({
    root: {
      position: 'relative',
      width: '100%'
    },
    content: ({ active }: any) => ({
      position: 'relative',
      minHeight: 40,
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 8,
      paddingBottom: 8,
      borderRadius: 30,
      background: palette.primary.light,
      color: palette.primary.dark,
      opacity: active ? 1 : 0.8,
      '&:hover': {
        boxShadow: active ? undefined : shadows[2]
      }
    }),
    inputLabel: {
      position: 'absolute',
      left: 0,
      top: 0,
      // slight alteration to spec spacing to match visual spec result
      transform: 'translate(0, 24px) scale(1)'
    },
    notchedOutline: ({ error, active }: any) => ({
      borderColor: isError(error) ? palette.error.main : active ? palette.primary.dark : palette.primary.dark,
      borderWidth: isError(error) || active ? 4 : 1,
      boxShadow: shadows[1]
    })
  })
);

// Needs some work to handle focused state.  It should use FormControl and formControlState.
export default function OutlinedDivActive({
  label = '',
  active = false,
  error = undefined,
  width = undefined,
  maxWidth = undefined,
  margin = undefined,
  marginTop = undefined,
  marginBottom = undefined,
  height = undefined,
  children = undefined
}) {
  const classes = useStyles({ active, error });

  return (
    <div className={classes.root} style={{ width, maxWidth, margin, marginTop, marginBottom, height }}>
      <InputLabel htmlFor={label} variant='outlined' className={classes.inputLabel} shrink>
        {label}
      </InputLabel>
      <Grid container id={label} className={classes.content} alignItems='center'>
        <Grid item xs={12}>
          {children}
        </Grid>
        <NotchedOutline className={classes.notchedOutline} notched />
      </Grid>
    </div>
  );
}
