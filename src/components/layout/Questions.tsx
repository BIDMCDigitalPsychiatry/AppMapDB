import * as React from 'react';
import { Grid, Link } from '@mui/material';
import Typography from '@mui/material/Typography';
import pkg from '../../../package.json';
import { useT, tx } from '../../i18n';

const primaryText = tx('Questions or Concerns?');

export default function Questions() {
  const t = useT();
  return (
    <Grid container alignItems='center'>
      <Grid item xs={12} style={{ textAlign: 'right' }}>
        <Typography variant='h6' align='right'>
          {t(primaryText)}
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ textAlign: 'right' }}>
        <Link href={`mailto:${pkg.contactEmail}`} underline='always' target='_blank' variant='body1' color='primary'>
          {pkg.contactEmail}
        </Link>
      </Grid>
    </Grid>
  );
}
