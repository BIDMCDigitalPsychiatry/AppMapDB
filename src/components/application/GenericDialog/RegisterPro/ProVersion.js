import { Grid, Typography } from '@mui/material';

export default function ProVersion() {
  return (
    <Grid
      container
      alignItems='center'
      spacing={2}
      sx={{
        backgroundColor: 'secondary.light',
        color: 'text.primary',
        padding: 3,
        borderRadius: 3
      }}
    >
      <Grid item xs={12}>
        <Typography variant='h5' style={{ fontWeight: 900 }}>
          Interested in the pro version?
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>Register now for access to the pro version!</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>Enables more advanced search filters, such as:</Typography>
        <Typography sx={{ mt: 1 }}>
          Cost, Developer Type, Supported Conditions, Functionalities, Uses, Features, Engagements, Clinical Foundations, Inputs, Outputs and Privacy Options.
        </Typography>
      </Grid>
    </Grid>
  );
}
