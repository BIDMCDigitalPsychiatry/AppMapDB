import { Box, Button, Typography } from '@mui/material';
import { useHandleLink } from '../../../hooks';

const InterestedAddApp = () => {
  const handleLink = useHandleLink('https://docs.google.com/forms/d/1n6HLuUhbncZG2NGbQgF5_cCmDkd8dY4UrEMVLmNFJA4/viewform?edit_requested=true');

  return (
    <Box sx={{ pl: 2, pr: 2, pb: 3 }}>
      <Typography sx={{ color: 'primary.main', textAlign: 'left', fontSize: 18, fontWeight: 700 }}>Interested in adding an app to MIND?</Typography>
      <Typography variant='body2' sx={{ mt: 0.5, mb: 1.5 }}>
        Fill out these questions for our team to review, and we'll get back to you soon!
      </Typography>
      <Button variant='contained' onClick={handleLink} sx={{ textTransform: 'none' }}>
        Suggest an App
      </Button>
    </Box>
  );
};

export default InterestedAddApp;
