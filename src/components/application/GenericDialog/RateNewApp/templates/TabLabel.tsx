import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useT } from '../../../../../i18n';

export default function TabLabel({ label, icon }) {
  const t = useT();
  return (
    <Grid container spacing={1}>
      <Grid item>
        <img style={{ height: 24 }} src={icon} alt={t(label)} />
      </Grid>
      <Grid item xs>
        <Typography>{t(label)}</Typography>
      </Grid>
    </Grid>
  );
}
