import { Button, Grid } from '@mui/material';
import PwaLogo from './PwaLogo';
import { useAppBarHeightSetRef } from '../layout/hooks';

const navButtonSize = 'normal' as any;

export default function PwaAppBar({ handleSearch, handleReset, handleBack, handleNext, disableBack = false, hideNext = false }) {
  const setRef = useAppBarHeightSetRef();
  return (
    <Grid ref={setRef} container justifyContent='space-between' alignItems='center' sx={{ pl: 2 }} spacing={1}>
      <Grid item sx={{ textAlign: 'center' }}>
        <PwaLogo />
      </Grid>
      <Grid item>
        <Grid container justifyContent='flex-end' spacing={1}>
          <Grid item>
            <Button variant='contained' size={navButtonSize} onClick={handleSearch}>
              Search
            </Button>
          </Grid>
          <Grid item>
            <Button variant='contained' size={navButtonSize} onClick={handleReset}>
              Reset
            </Button>
          </Grid>
          <Grid item>
            <Button variant='contained' size={navButtonSize} onClick={handleBack} disabled={disableBack}>
              Back
            </Button>
          </Grid>
          {!hideNext && (
            <Grid item>
              <Button variant='contained' size={navButtonSize} onClick={handleNext}>
                Next
              </Button>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}
