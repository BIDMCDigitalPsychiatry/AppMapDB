import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useT } from '../../../i18n';

export default function ErrorGate({ error, children }) {
  const t = useT();
  return error ? (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography align='center'>{t('Error loading data, please close and try again.')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography align='center' color='error'>
          {t('Error: {{error}}', { error: t(error) })}
        </Typography>
      </Grid>
    </Grid>
  ) : (
    children
  );
}
