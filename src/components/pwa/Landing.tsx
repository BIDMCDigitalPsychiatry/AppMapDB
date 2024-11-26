import { Button, Box, Divider, Stack, Container, Grid } from '@mui/material';
import logo from '../../images/Brain.svg';
import { usePwaActions } from './store';
import useHeight from '../layout/ViewPort/hooks/useHeight';
import useWidth from '../layout/ViewPort/hooks/useWidth';

const Header = () => (
  <Stack spacing={0}>
    <Box sx={{ color: 'primary.dark', fontWeight: 700, fontSize: 28, textAlign: 'center' }}>Welcome to</Box>
    <Box sx={{ color: 'primary.dark', fontWeight: 700, fontSize: 28, textAlign: 'center' }}>MINDapps!</Box>
    <Box sx={{ mt: 1 }}>
      <Divider sx={{ backgroundColor: 'primary.main', height: 6 }} />
    </Box>
  </Stack>
);

const StartButton = () => {
  const { next } = usePwaActions();
  return (
    <Button
      onClick={next}
      variant='contained'
      size='large'
      sx={{ backgroundColor: 'primary.dark', '&:hover': { backgroundColor: 'primary.main' }, fontSize: 22, minHeight: 64, fontWeight: 700 }}
    >
      START QUIZ!
    </Button>
  );
};

const HorizontalLayout = () => {
  return (
    <Stack spacing={0} alignItems='center' justifyContent='space-evenly' height='100vh' px={2}>
      <Grid container justifyContent='space-around' alignItems='center' spacing={8}>
        <Grid item sx={{ textAlign: 'center' }}>
          <Header /> <img src={logo} alt='mindapp' style={{ width: 120, marginTop: 32 }} />
        </Grid>
        <Grid item xs>
          <Box sx={{ fontSize: 16, textAlign: 'center' }}>
            Answer a few questions, and we will recommend mental health apps that meet your needs and preferences.
          </Box>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <StartButton />
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
};

const VerticalLayout = () => {
  return (
    <Stack spacing={0} alignItems='center' justifyContent='space-evenly' height='100vh'>
      <Header />
      <Box sx={{ fontSize: 16, textAlign: 'center', maxWidth: 400 }}>
        Answer a few questions, and we will recommend mental health apps that meet your needs and preferences.
      </Box>
      <img src={logo} alt='mindapp' style={{ width: 140 }} />
      <Box sx={{ textAlign: 'center' }}>
        <StartButton />
      </Box>
    </Stack>
  );
};

export default function Landing() {
  const height = useHeight();
  const width = useWidth();
  const isLandscape = width > height && height < 500;
  return <Container>{isLandscape ? <HorizontalLayout /> : <VerticalLayout />}</Container>;
}
