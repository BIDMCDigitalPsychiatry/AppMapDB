import React from 'react';
import ReactDOM from 'react-dom';
import { InputLabel, makeStyles, createStyles } from '@material-ui/core';
import NotchedOutline from '@material-ui/core/OutlinedInput/NotchedOutline';

const useStyles = makeStyles(({ shape }: any) =>
  createStyles({
    root: {
      position: 'relative',
      marginTop: 16,
      marginBottom: 24,
      width: '100%',
    },
    container: {
      position: 'relative',
    },
    content: {
      padding: 16,
      paddingTop: 8,
      paddingBottom: 8,
      borderRadius: shape.borderRadius,
    },
    inputLabel: {
      position: 'absolute',
      left: 0,
      top: 0,
      // slight alteration to spec spacing to match visual spec result
      transform: 'translate(0, 24px) scale(1)',
    },
  })
);

export default function OutlinedDiv({ label = '', maxWidth = undefined, margin = undefined, children = undefined }) {
  const classes = useStyles({});
  const [labelWidth, setLabelWidth] = React.useState(0);
  const labelRef = React.useRef(null);
  React.useEffect(() => {
    const labelNode: any = ReactDOM.findDOMNode(labelRef.current);
    setLabelWidth(labelNode != null ? labelNode.offsetWidth : 0);
  }, [label]);

  return (
    <div className={classes.root} style={{ maxWidth, margin }}>
      <InputLabel ref={labelRef} htmlFor={label} variant='outlined' className={classes.inputLabel} shrink>
        {label}
      </InputLabel>
      <div className={classes.container}>
        <div id={label} className={classes.content}>
          {children}
          <NotchedOutline notched labelWidth={labelWidth} />
        </div>
      </div>
    </div>
  );
}
