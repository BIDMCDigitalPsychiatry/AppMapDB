import * as React from 'react';
import { Typography } from '@mui/material';
import { makeStyles } from '../../../styles/jss';
import { createStyles } from '../../../styles/jss';
const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    root: ({ disabled }: any) => ({
      color: disabled ? palette.text.disabled : 'inherit',
      fontSize: 24,
      fontWeight: 600
    })
  })
);

const LabelCenter = ({ label, disabled }) => (
  <Typography align='center' style={{ marginBottom: 16 }} className={useStyles({ disabled }).root}>
    {label}
  </Typography>
);

export default LabelCenter;
