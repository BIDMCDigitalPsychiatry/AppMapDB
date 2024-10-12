import { Box, Grid, Typography } from '@mui/material';
import ArrowButton from '../../general/ArrowButton';
import grey from '@mui/material/colors/grey';
import { useHandleChangeRoute } from '../../layout/hooks';
import { publicUrl } from '../../../helpers';

const InterestedRateApp = () => {
  const handleChangeRoute = useHandleChangeRoute();

  return (
    <Box p={0} sx={{ backgroundColor: grey[100], borderRadius: 0, pl: 2, pr: 1 }}>
      <Grid container alignItems='center' spacing={1}>
        <Grid item xs={12}>
          <Typography sx={{ color: 'primary.main', textAlign: 'left', fontSize: 22, fontWeight: 700 }}>Interested in rating an app?</Typography>
        </Grid>
        <Grid item xs={12} style={{ textAlign: 'right' }}>
          <ArrowButton label='Rate an App' onClick={handleChangeRoute(publicUrl('/RateAnApp'))} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default InterestedRateApp;
