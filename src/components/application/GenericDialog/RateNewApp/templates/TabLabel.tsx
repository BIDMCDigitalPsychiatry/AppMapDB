import React from 'react';
import { Grid, Typography } from '@mui/material';

export default function TabLabel({ label, icon }) {
  return (
    <Grid container spacing={1}>
      <Grid item>
        <img style={{ height: 24 }} src={icon} alt={label} />
      </Grid>
      <Grid item xs>
        <Typography>{label}</Typography>
      </Grid>
    </Grid>
  );
}
