import React from 'react';
import { Button, Grid, Typography } from '@mui/material';
import { publicUrl } from '../../../../helpers';
import { useChangeRoute } from '../../../layout/hooks';
import * as Icons from '@mui/icons-material';

export default function RateAnApp({ onClick = undefined }) {
  const changeRoute = useChangeRoute();

  const handleRateApp = React.useCallback(() => {
    changeRoute(publicUrl('/RateAnApp'));
    onClick && onClick();
  }, [changeRoute, onClick]);

  return (
    <Grid
      container
      alignItems='center'
      spacing={2}
      sx={{
        backgroundColor: 'secondary.light',
        color: 'text.primary',
        p: 2,
        pt: 0,
        borderRadius: 3
      }}
    >
      <Grid item xs={12}>
        <Typography variant='h5' style={{ fontWeight: 900 }}>
          Interested in joining the team?
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>Our database is sourced by app reviews from trained app raters. Rating an app is an interactive process.</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>
          Raters will be prompted through 105 different questions about an app and its features, privacy settings, clinical foundations and more.
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ textAlign: 'left' }}>
        <Button sx={{ borderRadius: 3 }} onClick={handleRateApp}>
          <Grid container spacing={1}>
            <Grid item>
              <Typography
                sx={{
                  fontWeight: 900,
                  color: 'primary.dark'
                }}
              >
                Rate an App
              </Typography>
            </Grid>
            <Grid item>
              <Icons.ArrowRightAlt sx={{ color: 'primary.light' }} />
            </Grid>
          </Grid>
        </Button>
      </Grid>
    </Grid>
  );
}
