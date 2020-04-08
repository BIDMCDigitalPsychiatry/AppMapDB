import React from 'react';
import { Grid } from '@material-ui/core';
import { InjectField } from '../../Fields';
import { ApplicationTabs } from './ApplicationTabs';

export default function Review({ fields, values, mapField, fullWidth, setValues, state, setState, ...props }) {
  const injectField = id => <InjectField id={id} fields={fields} values={values} mapField={mapField} fullWidth={fullWidth} {...props} />;

  return (
    <Grid container justify='center' spacing={3}>
      <Grid item xs style={{ maxWidth: 700 }}>
        <ApplicationTabs state={state} values={values} injectField={injectField} fields={fields} setValues={setValues} setState={setState} />
      </Grid>
      <Grid item xs style={{ minWidth: 280, maxWidth: 600 }}>
        <Grid container spacing={1}>
          {injectField('review')}
        </Grid>
      </Grid>
    </Grid>
  );
}
