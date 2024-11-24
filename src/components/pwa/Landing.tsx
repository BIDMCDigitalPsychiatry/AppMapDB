import { Button, Grid, Box } from '@mui/material';
import logo from '../../images/logo_blue.png';
import { usePwaActions } from './store';

export default function Landing() {
  const { next } = usePwaActions();
  return (
    <Box sx={{ textAlign: 'center', display: 'flex', justifyContent: 'center', px: 1, py: 2 }}>
      <Box sx={{ maxWidth: 400, borderRadius: 5, border: 4, borderColor: 'black', px: 1, py: 4 }}>
        <Grid container spacing={6}>
          <Grid item xs={12} sx={{ fontWeight: 700, fontSize: 24, textAlign: 'center' }}>
            Welcome to MINDapps!
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'center' }}>
            <img src={logo} alt='mindapp' style={{ maxWidth: 88 }} />
          </Grid>
          <Grid item xs={12} sx={{ fontSize: 18, textAlign: 'center' }}>
            Take this quiz to find a suitable app.
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'center' }}>
            <Button onClick={next} variant='contained' size='large' sx={{ minHeight: 64 }}>
              Start Quiz!
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
