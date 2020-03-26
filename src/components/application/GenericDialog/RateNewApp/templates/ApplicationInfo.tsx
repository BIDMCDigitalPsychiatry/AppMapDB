import React from 'react';
import { Grid } from '@material-ui/core';
import { InjectField } from '../../Fields';
import { tables } from '../../../../../database/dbConfig';
import { ApplicationTabs } from './ApplicationTabs';

export default function ApplicationInfo({ fields, values, mapField, fullWidth, setValues, state, setState, ...props }) {
  const injectField = id => <InjectField id={id} fields={fields} values={values} mapField={mapField} fullWidth={fullWidth} {...props} />;
  const platforms = values[tables.applications].platforms ?? [];

  return (
    <Grid container justify='center' spacing={3}>
      <Grid item xs style={{ maxWidth: 700 }}>
        <ApplicationTabs state={state} values={values} injectField={injectField} fields={fields} setValues={setValues} setState={setState} />
      </Grid>
      <Grid item xs style={{ minWidth: 280, maxWidth: 600 }}>
        <Grid container spacing={1}>
          {platforms.length === 1 && platforms[0] === 'Web' && (
            <>
              {injectField('name')}
              {injectField('company')}
            </>
          )}
          {injectField('conditions')}
          {injectField('costs')}
          {injectField('developerTypes')}
          {injectField('functionalities')}
          {injectField('features')}
          {injectField('engagements')}
          {injectField('uses')}
          {injectField('inputs')}
          {injectField('outputs')}
        </Grid>
      </Grid>
    </Grid>
  );
}
