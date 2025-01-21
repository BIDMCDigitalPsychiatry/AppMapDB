import { Button, Box, Divider, Stack, Container, Grid, useMediaQuery } from '@mui/material';
import logo from '../../images/Brain.svg';
import { usePwaActions } from './store';
import useHeight from '../layout/ViewPort/hooks/useHeight';
import useWidth from '../layout/ViewPort/hooks/useWidth';

const headerFontSize = 48;
const textFontSize = 24;
const buttonWidth = 140;
const buttonMinHeight = 60;

const Header = ({ xs = undefined }) => (
  <Stack spacing={0}>
    <Box sx={{ color: 'primary.dark', fontWeight: 700, fontSize: xs ? headerFontSize - 8 : headerFontSize, textAlign: 'center' }}>Welcome to</Box>
    <Box sx={{ color: 'primary.dark', fontWeight: 700, fontSize: xs ? headerFontSize - 8 : headerFontSize, textAlign: 'center' }}>MINDapps!</Box>
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
      size='medium'
      sx={{
        p: 0,
        m: 0,
        backgroundColor: 'primary.dark',
        '&:hover': { backgroundColor: 'primary.main' },
        fontSize: 15,
        minHeight: buttonMinHeight,
        fontWeight: 700,
        width: buttonWidth
      }}
    >
      START QUIZ
    </Button>
  );
};

const SearchButton = () => {
  const { search } = usePwaActions();
  return (
    <Button
      onClick={search}
      variant='contained'
      size='medium'
      sx={{
        p: 0,
        m: 0,
        backgroundColor: 'primary.dark',
        '&:hover': { backgroundColor: 'primary.main' },
        fontSize: 15,
        minHeight: buttonMinHeight,
        fontWeight: 700,
        width: buttonWidth
      }}
    >
      SEARCH APPS
    </Button>
  );
};

const HorizontalButtons = () => {
  const xs = useMediaQuery('(max-width:800px)');
  const xs2 = useMediaQuery('(max-width:600px)');
  return (
    <Grid container spacing={1.5} justifyContent='center' alignItems='center'>
      <Grid item>
        <StartButton />
      </Grid>
      {!xs2 && (
        <Grid item sx={{ fontWeight: 'bold' }}>
          OR
        </Grid>
      )}
      <Grid item>
        <SearchButton />
      </Grid>
    </Grid>
  );
};

const VerticalButtons = () => {
  const xs = useMediaQuery('(max-width:300px)');
  return (
    <Grid container spacing={1.5} justifyContent='center' alignItems='center'>
      <Grid item>
        <StartButton />
      </Grid>

      {!xs && (
        <Grid item sx={{ fontWeight: 'bold' }}>
          OR
        </Grid>
      )}

      <Grid item>
        <SearchButton />
      </Grid>
    </Grid>
  );
};

const HorizontalLayout = () => {
  const xs = useMediaQuery('(max-width:800px)');
  return (
    <Stack spacing={0} alignItems='center' justifyContent='space-evenly' height='100vh' px={2}>
      <Grid container justifyContent='space-between' alignItems='center' spacing={xs ? 6 : 8}>
        <Grid item sx={{ textAlign: 'center' }}>
          <Header xs={xs} /> <img src={logo} alt='mindapp' style={{ width: 120, marginTop: 32 }} />
        </Grid>
        <Grid item xs>
          <Box sx={{ fontSize: xs ? textFontSize - 4 : textFontSize, textAlign: 'center' }}>
            Answer a few questions, and we will recommend mental health apps that meet your needs and preferences.
          </Box>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <HorizontalButtons />
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
};

const VerticalLayout = () => {
  return (
    <Stack spacing={0} alignItems='center' justifyContent='space-evenly' height='100vh'>
      <Box sx={{ px: 1 }}>
        <Header />
        <Box sx={{ fontSize: textFontSize, textAlign: 'center', maxWidth: 400, pt: 2 }}>
          Answer a few questions, and we will recommend mental health apps that meet your needs and preferences.
        </Box>
      </Box>
      <img src={logo} alt='mindapp' style={{ width: 180 }} />
      <Box sx={{ textAlign: 'center' }}>
        <VerticalButtons />
      </Box>
    </Stack>
  );
};

export default function Landing() {
  const height = useHeight();
  const width = useWidth();
  const isLandscape = width > height && height < 500;
  return (
    <Container disableGutters={true} maxWidth='xl' sx={{ px: 0.5, m: 0 }}>
      {isLandscape ? <HorizontalLayout /> : <VerticalLayout />}
    </Container>
  );
}
