import React from 'react';
import ReactDOM from 'react-dom';
import { Grid, InputLabel, makeStyles, createStyles } from '@material-ui/core';
import NotchedOutline from '@material-ui/core/OutlinedInput/NotchedOutline';
import { isError } from '../../../helpers';

const useStyles = makeStyles(({ palette, shape }: any) =>
  createStyles({
    root: {
      position: 'relative',
      width: '100%'
    },
    container: {
      position: 'relative'
    },
    content: {
      minHeight: 40,
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 8,
      paddingBottom: 8,
      borderRadius: shape.borderRadius,
      borderColor: palette.type === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
      '&:hover': {
        borderColor: palette.text.primary
      }
    },
    inputLabel: {
      position: 'absolute',
      left: 0,
      top: 0,
      // slight alteration to spec spacing to match visual spec result
      transform: 'translate(0, 24px) scale(1)'
    },
    notchedOutline: ({ error }: any) => ({
      borderColor: isError(error) ? palette.error.main : 'inherit'
    })
  })
);

// Needs some work to handle focused state.  It should use FormControl and formControlState.
export default function OutlinedDiv({
  label = '',
  error = undefined,
  width = undefined,
  maxWidth = undefined,
  margin = undefined,
  marginTop = undefined,
  marginBottom = undefined,
  height = undefined,
  children = undefined
}) {
  const classes = useStyles({ error });
  const [labelWidth, setLabelWidth] = React.useState(0);
  const labelRef = React.useRef(null);
  React.useEffect(() => {
    const labelNode: any = ReactDOM.findDOMNode(labelRef.current);
    setLabelWidth(labelNode != null ? labelNode.offsetWidth : 0);
  }, [label]);

  return (
    <div className={classes.root} style={{ width, maxWidth, margin, marginTop, marginBottom, height }}>
      <InputLabel ref={labelRef} htmlFor={label} variant='outlined' className={classes.inputLabel} shrink>
        {label}
      </InputLabel>
      <div className={classes.container}>
        <Grid container id={label} className={classes.content} alignItems='center'>
          <Grid item xs={12}>
            {children}
          </Grid>
          <NotchedOutline className={classes.notchedOutline} notched labelWidth={labelWidth} />
        </Grid>
      </div>
    </div>
  );
}
