import { Button, Grid, Typography } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { useT } from '../../../../i18n';

export default function ProVersion({ handleRegisterPro }) {
  const t = useT();
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
          {t('Interested in the pro version?')}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>{t('Enables advanced search filters, such as:')}</Typography>
        <Typography sx={{ mt: 1 }}>
          {t('Cost, Developer Type, Supported Conditions, Functionalities, Uses, Features, Engagements, Clinical Foundations, Inputs, Outputs and Privacy Options.')}
        </Typography>
      </Grid>
      {handleRegisterPro && (
        <Grid item xs={12} style={{ textAlign: 'left' }}>
          <Button sx={{ borderRadius: 3 }} onClick={handleRegisterPro}>
            <Grid container spacing={1}>
              <Grid item>
                <Typography
                  sx={{
                    fontWeight: 900,
                    color: 'primary.dark'
                  }}
                >
                  {t('Sign Up for Pro Version')}
                </Typography>
              </Grid>
              <Grid item>
                <Icons.ArrowRightAlt sx={{ color: 'primary.light' }} />
              </Grid>
            </Grid>
          </Button>
        </Grid>
      )}
    </Grid>
  );
}
