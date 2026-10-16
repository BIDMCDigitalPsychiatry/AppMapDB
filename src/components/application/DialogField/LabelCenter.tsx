import * as React from 'react';
import { Typography } from '@mui/material';
import { makeStyles } from '../../../styles/jss';
import { createStyles } from '../../../styles/jss';
import { useT } from '../../../i18n';
const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    root: ({ disabled }: any) => ({
      color: disabled ? palette.text.disabled : 'inherit',
      fontSize: 24,
      fontWeight: 600
    })
  })
);

const LabelCenter = ({ label, disabled }) => {
  const t = useT();
  return (
    <Typography align='center' style={{ marginBottom: 16 }} className={useStyles({ disabled }).root}>
      {t(label)}
    </Typography>
  );
};

export default LabelCenter;
