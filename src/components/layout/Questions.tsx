import * as React from 'react';
import { Grid, Link } from '@mui/material';
import Typography from '@mui/material/Typography';
import { contactEmail } from '../../../package.json';

const primaryText = 'Questions or Concerns?';

export default function Questions() {
  return (
    <Grid container alignItems='center'>
      <Grid item xs={12} style={{ textAlign: 'right' }}>
        <Typography variant='h6' align='right'>
          {primaryText}
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ textAlign: 'right' }}>
        <Link href={`mailto:${contactEmail}`} underline='always' target='_blank' variant='body1' color='primary'>
          {contactEmail}
        </Link>
      </Grid>
    </Grid>
  );
}
