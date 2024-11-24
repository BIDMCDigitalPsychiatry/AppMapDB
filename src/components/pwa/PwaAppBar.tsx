import { Button, Grid } from '@mui/material';
import PwaLogo from './PwaLogo';
import { useAppBarHeightSetRef } from '../layout/hooks';
import { usePwaActions, useShowResults } from './store';

const navButtonSize = 'normal' as any;

export default function PwaAppBar() {
  const setRef = useAppBarHeightSetRef();
  const { search, reset, back, next } = usePwaActions();
  const showResults = useShowResults();
  const disableNext = !showResults;
  const disableSearch = !showResults;
  const disableBack = false;
  const hideNext = false;
  const hideSearch = false;

  return (
    <Grid ref={setRef} container justifyContent='space-between' alignItems='center' spacing={0.75}>
      <Grid item sx={{ textAlign: 'center' }}>
        <PwaLogo />
      </Grid>
      <Grid item>
        <Grid container justifyContent='flex-end' spacing={0.75}>
          {!hideSearch && (
            <Grid item>
              <Button variant='contained' size={navButtonSize} onClick={search} disabled={disableSearch} sx={{ px: 0, minWidth: 56 }}>
                Search
              </Button>
            </Grid>
          )}
          <Grid item>
            <Button variant='contained' size={navButtonSize} onClick={reset} sx={{ px: 0, minWidth: 56 }}>
              Reset
            </Button>
          </Grid>
          <Grid item>
            <Button variant='contained' size={navButtonSize} onClick={back} disabled={disableBack} sx={{ px: 0, minWidth: 56 }}>
              Back
            </Button>
          </Grid>
          {!hideNext && (
            <Grid item>
              <Button variant='contained' size={navButtonSize} onClick={next} disabled={disableNext} sx={{ px: 0, minWidth: 56 }}>
                Next
              </Button>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}
