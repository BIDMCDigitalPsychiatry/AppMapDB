import React from 'react';
import { Grid, Typography } from '@material-ui/core';

export default function ErrorGate({ error, children }) {
  return error ? (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography align='center'>Error loading data, please close and try again.</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography align='center' color='error'>
          Error: {error}
        </Typography>
      </Grid>
    </Grid>
  ) : (
    children
  );
}
