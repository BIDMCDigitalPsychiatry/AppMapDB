import { AppBar, Button, ButtonGroup, Collapse, Grid, Toolbar } from '@mui/material';
import PwaLogo from './PwaLogo';
import { useAppBarHeightSetRef } from '../layout/hooks';
import { usePwaActions } from './store';
import { useSelector } from 'react-redux';
import { AppState } from '../../store';
import QuestionHeader from './QuestionHeader';
import { searchIndex } from './questions';

const navButtonSize = 'normal' as any;
const px = 1;

export default function PwaAppBar() {
  const setRef = useAppBarHeightSetRef();
  const { search, reset, back, next } = usePwaActions();
  const index = useSelector((s: AppState) => s.pwa.index);

  const disableNext = index === searchIndex || index < 0;
  const disableSearch = index === searchIndex || index < 0;
  const disableReset = index < 0;
  const disableBack = index < 0;

  return (
    <AppBar ref={setRef} position='fixed' color='inherit' elevation={2} sx={{ px: 0, backgroundColor: 'grey.200' }}>
      <Toolbar disableGutters={true} variant='dense' sx={{ px: 1 }}>
        <Grid container alignItems='center' spacing={0} justifyContent='space-between'>
          <Grid item>
            <PwaLogo />
          </Grid>
          <Grid item>
            <ButtonGroup variant='contained' aria-label='version button group' size='small'>
              <Button variant='contained' size={navButtonSize} onClick={reset} disabled={disableReset} sx={{ px }}>
                Reset
              </Button>
              <Button variant='contained' size={navButtonSize} onClick={back} disabled={disableBack} sx={{ px }}>
                Back
              </Button>
              <Button variant='contained' size={navButtonSize} onClick={next} disabled={disableNext} sx={{ px }}>
                Next
              </Button>
              <Button variant='contained' size={navButtonSize} onClick={search} disabled={disableSearch} sx={{ px }}>
                Search
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      </Toolbar>
      <Collapse in={index >= 0 && index < searchIndex}>
        <Toolbar disableGutters={true} variant='dense' sx={{ pb: 0, backgroundColor: 'grey.200' }}>
          <QuestionHeader />
        </Toolbar>
      </Collapse>
    </AppBar>
  );
}
