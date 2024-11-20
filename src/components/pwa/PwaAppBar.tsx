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
    <Grid ref={setRef} container justifyContent='space-between' alignItems='center' spacing={0.75}>
      <Grid item sx={{ textAlign: 'center' }}>
        <PwaLogo />
      </Grid>
      <Grid item>
        <Grid container justifyContent='flex-end' spacing={0.75}>
          {!hideSearch && (
            <Grid item>
              <Button variant='contained' size={navButtonSize} onClick={handleSearch} disabled={disableSearch} sx={{ px: 0, minWidth: 56 }}>
                Search
              </Button>
            </Grid>
          )}
          <Grid item>
            <Button variant='contained' size={navButtonSize} onClick={handleReset} sx={{ px: 0, minWidth: 56 }}>
              Reset
            </Button>
          </Grid>
          <Grid item>
            <Button variant='contained' size={navButtonSize} onClick={handleBack} disabled={disableBack} sx={{ px: 0, minWidth: 56 }}>
              Back
            </Button>
          </Grid>
          {!hideNext && (
            <Grid item>
              <Button variant='contained' size={navButtonSize} onClick={handleNext} disabled={disableNext} sx={{ px: 0, minWidth: 56 }}>
                Next
              </Button>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}
