import { Box, Button, Grid, Typography } from '@mui/material';
import { useHandleChangeRoute } from '../../layout/hooks';
import { publicUrl } from '../../../helpers';
import { useT } from '../../../i18n';

const InterestedRateApp = () => {
  const t = useT();
  const handleChangeRoute = useHandleChangeRoute();

  return (
    <Box sx={{ backgroundColor: '#F7F9FC', border: '1px solid #E5EAF0', borderRadius: 1.5, px: 2, py: 1.25 }}>
      <Grid container alignItems='center' spacing={2}>
        <Grid item xs>
          <Typography sx={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>{t('Interested in rating an app?')}</Typography>
          <Typography variant='body2' color='textSecondary' sx={{ mt: 0.25 }}>
            {t('Join our volunteer raters and help evaluate mental health apps using the MIND framework.')}
          </Typography>
        </Grid>
        <Grid item>
          <Button variant='contained' onClick={handleChangeRoute(publicUrl('/RateAnApp'))} sx={{ textTransform: 'none', fontWeight: 600 }}>
            {t('Rate an App')}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InterestedRateApp;
