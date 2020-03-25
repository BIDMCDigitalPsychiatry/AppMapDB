import React from 'react';
import { Grid, Box, Typography } from '@material-ui/core';
import { InjectField } from '../../Fields';
import OutlinedDiv from '../../../../general/OutlinedDiv/OutlinedDiv';
import { useFullScreen } from '../../../../../hooks';

export default function ApplicationProperties({ fields, values, mapField, fullWidth, ...props }) {
  const injectField = id => <InjectField id={id} fields={fields} values={values} mapField={mapField} fullWidth={fullWidth} {...props} />;
  const fullScreen = useFullScreen();
  const xs = fullScreen ? 12 : 6;
  return (
    <Grid container justify='center'>
      <Grid item style={{ maxWidth: 1400 }}>
        <Grid container justify='center' spacing={2}>
          <Grid item xs={xs} style={{ minWidth: 280, maxWidth: 675 }}>
            <OutlinedDiv label='Content'>
              {injectField('correctContent')}
              <Box p={0.25}>
                <Grid container alignItems='center' justify='space-between'>
                  <Typography>Reading level of the privacy policy (what grade reading level)?</Typography>
                  <Box pl={2} width={75}>
                    {injectField('readingLevel')}
                  </Box>
                </Grid>
              </Box>
            </OutlinedDiv>
          </Grid>
          <Grid item xs={xs} style={{ minWidth: 280, maxWidth: 675 }}>
            <OutlinedDiv label='Studies'>
              <Box p={0.3}>
                <Grid container alignItems='center' justify='space-between'>
                  <Typography>How many feasibility/usability studies?</Typography>
                  <Box pl={2} width={75}>
                    {injectField('feasibilityStudies')}
                  </Box>
                </Grid>

                <Grid container alignItems='center' justify='space-between'>
                  <Typography>What is the highest feasibility impact factor?</Typography>
                  <Box pl={2} width={75}>
                    {injectField('feasibilityImpact')}
                  </Box>
                </Grid>

                <Grid container alignItems='center' justify='space-between'>
                  <Typography>How many evidence/efficacy studies?</Typography>
                  <Box pl={2} width={75}>
                    {injectField('efficacyStudies')}
                  </Box>
                </Grid>

                <Grid container alignItems='center' justify='space-between'>
                  <Typography>What is the highest efficacy impact factor?</Typography>
                  <Box pl={2} width={75}>
                    {injectField('efficacyImpact')}
                  </Box>
                </Grid>
              </Box>
            </OutlinedDiv>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
