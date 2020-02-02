import React from 'react';
import Fields from './Fields';
import { Grid } from '@material-ui/core';

const FieldsTemplate = ({ Template, ...other }: any) =>
  Template ? (
    <Grid container alignItems='center' justify='center'>
      <Template {...other} />
    </Grid>
  ) : (
    <Grid container alignItems='center' spacing={1}>
      <Fields {...other} />
    </Grid>
  );

export default FieldsTemplate;
