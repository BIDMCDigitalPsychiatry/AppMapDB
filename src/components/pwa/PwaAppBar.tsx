import { Button, Grid } from '@mui/material';
import PwaLogo from './PwaLogo';
import { useAppBarHeightSetRef } from '../layout/hooks';

const navButtonSize = 'normal' as any;

export default function PwaAppBar({
  handleSearch,
  handleReset,
  handleBack,
  handleNext,
  disableSearch = false,
  disableNext = false,
  disableBack = false,
  hideNext = false,
  hideSearch = false
}) {
  const setRef = useAppBarHeightSetRef();
  return (
    <Grid ref={setRef} container justifyContent='space-between' alignItems='center' spacing={1}>
      <Grid item sx={{ textAlign: 'center' }}>
        <PwaLogo />
      </Grid>
      <Grid item>
        <Grid container justifyContent='flex-end' spacing={1}>
          {!hideSearch && (
            <Grid item>
              <Button variant='contained' size={navButtonSize} onClick={handleSearch} disabled={disableSearch} sx={{ px: 0 }}>
                Search
              </Button>
            </Grid>
          )}
          <Grid item>
            <Button variant='contained' size={navButtonSize} onClick={handleReset} sx={{ px: 0 }}>
              Reset
            </Button>
          </Grid>
          <Grid item>
            <Button variant='contained' size={navButtonSize} onClick={handleBack} disabled={disableBack} sx={{ px: 0 }}>
              Back
            </Button>
          </Grid>
          {!hideNext && (
            <Grid item>
              <Button variant='contained' size={navButtonSize} onClick={handleNext} disabled={disableNext} sx={{ px: 0 }}>
                Next
              </Button>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}
