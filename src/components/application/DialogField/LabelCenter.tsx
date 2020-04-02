import * as React from 'react';
import { Typography } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core';

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    root: ({ disabled }: any) => ({
      color: disabled ? palette.text.disabled : 'inherit'
    })
  })
);

const Label = ({ label, disabled }) => (
  <Typography variant='h5' align='center' style={{ marginBottom: 16 }} className={useStyles({ disabled }).root}>
    {label}
  </Typography>
);

export default Label;
