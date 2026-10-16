import * as React from 'react';
import { Typography } from '@mui/material';
import { makeStyles } from '../../../styles/jss';
import { createStyles } from '../../../styles/jss';
import { useT } from '../../../i18n';
const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    root: ({ disabled }: any) => ({
      color: disabled ? palette.text.disabled : undefined
    })
  })
);

const LabelError = ({ label, disabled }) => {
  const t = useT();
  return (
    <Typography color='error' className={useStyles({ disabled }).root}>
      {t(label)}
    </Typography>
  );
};

export default LabelError;
