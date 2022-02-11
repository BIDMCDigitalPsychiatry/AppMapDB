import React from 'react';
import Fields from './Fields';
import { Grid } from '@mui/material';

const FieldsTemplate = ({ Template, ...other }: any) =>
  Template ? (
    <Grid container alignItems='center' justifyContent='center'>
      <Template {...other} />
    </Grid>
  ) : (
    <Grid container alignItems='center' spacing={1}>
      <Fields {...other} />
    </Grid>
  );

export default FieldsTemplate;
