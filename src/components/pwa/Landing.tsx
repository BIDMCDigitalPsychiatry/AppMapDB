import { Button, Box, Divider, Stack, Container, Grid, useMediaQuery } from '@mui/material';
import logo from '../../images/Brain.svg';
import { usePwaActions } from './store';
import useHeight from '../layout/ViewPort/hooks/useHeight';
import useWidth from '../layout/ViewPort/hooks/useWidth';

const headerFontSize = 48;
const textFontSize = 24;

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
      sx={{ backgroundColor: 'primary.dark', '&:hover': { backgroundColor: 'primary.main' }, fontSize: 16, minHeight: 64, fontWeight: 700, width: 148 }}
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
      sx={{ backgroundColor: 'primary.dark', '&:hover': { backgroundColor: 'primary.main' }, fontSize: 16, minHeight: 64, fontWeight: 700, width: 148 }}
    >
      SEARCH APPS
    </Button>
  );
};

const HorizontalButtons = () => {
  const xs = useMediaQuery('(max-width:800px)');
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

const VerticalButtons = () => {
  const xs = useMediaQuery('(max-width:400px)');
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
      <Grid container justifyContent='space-around' alignItems='center' spacing={8}>
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
      <Header />
      <Box sx={{ fontSize: textFontSize, textAlign: 'center', maxWidth: 400 }}>
        Answer a few questions, and we will recommend mental health apps that meet your needs and preferences.
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
  return <Container>{isLandscape ? <HorizontalLayout /> : <VerticalLayout />}</Container>;
}
