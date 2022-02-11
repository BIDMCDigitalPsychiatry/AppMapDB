import * as React from 'react';
import { Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    root: ({ disabled }: any) => ({
      color: disabled ? palette.text.disabled : 'inherit'
    })
  })
);

const Label = ({ label, disabled }) => <Typography className={useStyles({ disabled }).root}>{label}</Typography>;

export default Label;
