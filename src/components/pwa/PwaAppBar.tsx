import { AppBar, Button, Grid, Toolbar } from '@mui/material';
import PwaLogo from './PwaLogo';
import { useAppBarHeightSetRef } from '../layout/hooks';
import { usePwaActions } from './store';
import { useSelector } from 'react-redux';
import { AppState } from '../../store';
import QuestionHeader from './QuestionHeader';
import { searchIndex } from './questions';
import useWidth from '../layout/ViewPort/hooks/useWidth';

export default function PwaAppBar() {
  const setRef = useAppBarHeightSetRef();
  const { search, reset, back } = usePwaActions();
  const index = useSelector((s: AppState) => s.pwa.index);
  const disableSearch = index === searchIndex || index < 0;
  const disableReset = index < 0;
  const disableBack = index < 0;
  const width = useWidth();
  const size = width < 350 ? 'small' : 'medium';

  return (
    <AppBar ref={setRef} position='fixed' color='inherit' elevation={2} sx={{ px: 0, backgroundColor: 'grey.200' }}>
      <Toolbar disableGutters={true} variant='dense' sx={{ px: 1 }}>
        <Grid container alignItems='center' spacing={0} justifyContent='space-between'>
          <Grid item sx={{ pt: 0.5 }}>
            <PwaLogo />
          </Grid>
          <Grid item>
            <Grid container spacing={size === 'medium' ? 1 : 0.5}>
              {index === searchIndex && (
                <Grid item>
                  <Button variant='contained' size={size} onClick={back} /*startIcon={<Icons.KeyboardArrowLeft />}*/ disabled={disableBack}>
                    Back
                  </Button>
                </Grid>
              )}
              <Grid item>
                <Button variant='contained' size={size} onClick={reset} /*startIcon={<Icons.Restore />}*/ disabled={disableReset}>
                  Reset
                </Button>
              </Grid>
              <Grid item>
                <Button variant='contained' size={size} onClick={search} /*startIcon={<Icons.Search />}*/ disabled={disableSearch}>
                  Search
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Toolbar>
      {index >= 0 && index < searchIndex && (
        <Toolbar disableGutters={true} variant='dense' sx={{ pb: 0, backgroundColor: 'grey.200' }}>
          <QuestionHeader />
        </Toolbar>
      )}
    </AppBar>
  );
}
