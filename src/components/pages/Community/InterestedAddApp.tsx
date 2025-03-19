import { Box, Grid, Typography } from '@mui/material';
import { useHandleLink } from '../../../hooks';
import * as Icons from '@mui/icons-material';

const InterestedAddApp = () => {
  const handleLink = useHandleLink('https://docs.google.com/forms/d/1n6HLuUhbncZG2NGbQgF5_cCmDkd8dY4UrEMVLmNFJA4/viewform?edit_requested=true');

  return (
    <Box p={0} sx={{ borderRadius: 0, pl: 2, pr: 1, cursor: 'pointer', pb: 3 }} onClick={handleLink}>
      <Grid container alignItems='center' spacing={1}>
        <Grid item>
          <Typography sx={{ color: 'primary.main', textAlign: 'left', fontSize: 22, fontWeight: 700 }}>Interested in adding an app to MIND?</Typography>
        </Grid>
      </Grid>
      <Grid container spacing={0.5} alignItems='center' sx={{ mt: 0.5 }}>
        <Grid item xs sx={{ fontWeight: 600 }}>
          Fill out these questions for our team to review, and we'll get back to you soon!
        </Grid>
        <Grid item>
          <Icons.ArrowRightAlt sx={{ color: 'primary.light', fontSize: 32, marginTop: 0 }} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default InterestedAddApp;
