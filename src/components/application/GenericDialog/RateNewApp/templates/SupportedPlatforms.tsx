import React from 'react';
import { Grid } from '@mui/material';
import { InjectField } from '../../Fields';

export default function SupportedPlatforms({ fields, values, mapField, fullWidth, ...props }) {
  const injectField = id => <InjectField id={id} fields={fields} values={values} mapField={mapField} fullWidth={fullWidth} {...props} />;
  return (
    <Grid container justifyContent='center' spacing={1}>
      <Grid item style={{ width: 330 }}>
        {injectField('platforms')}
      </Grid>
      <Grid item xs style={{ minWidth: 280, maxWidth: 500 }}>
        <Grid container spacing={1}>
          {injectField('androidLink')}
          {injectField('iosLink')}
          {injectField('webLink')}
        </Grid>
      </Grid>
    </Grid>
  );
}
