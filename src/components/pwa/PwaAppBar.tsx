import { AppBar, Button, ButtonGroup, Grid, Toolbar, useMediaQuery } from '@mui/material';
import PwaLogo from './PwaLogo';
import { useAppBarHeightSetRef } from '../layout/hooks';
import { usePwaActions } from './store';
import { useSelector } from 'react-redux';
import { AppState } from '../../store';
import QuestionHeader, { usePwaTextFontSize } from './QuestionHeader';
import { searchIndex } from './questions';
import useWidth from '../layout/ViewPort/hooks/useWidth';
import LanguageSelector from '../../i18n/LanguageSelector';
import { useT } from '../../i18n';

export default function PwaAppBar() {
  const t = useT();
  const setRef = useAppBarHeightSetRef();
  const { search, reset, back } = usePwaActions();
  const index = useSelector((s: AppState) => s.pwa.index);
  const disableSearch = index === searchIndex || index < 0;
  const disableReset = index < 0;
  const disableBack = index < 0;
  const width = useWidth();
  const size = width < 450 ? 'small' : 'medium';
  const px = width < 350 ? 1 : 2;

  const pwaTextFontSize = usePwaTextFontSize();

  const xs = useMediaQuery('(max-width:400px)');
  const xs2 = useMediaQuery('(max-width:330px)');

  return (
    <AppBar ref={setRef} position='fixed' color='inherit' elevation={2} sx={{ px: 0, backgroundColor: 'grey.200' }}>
      <Toolbar disableGutters={true} variant='regular' sx={{ px: 1 }}>
        <Grid container alignItems='center' spacing={0} justifyContent='space-between'>
          <Grid item sx={{ pt: 0.5 }}>
            <PwaLogo />
          </Grid>
          <Grid item>
            <Grid container spacing={1} alignItems='center'>
              <Grid item>
                <LanguageSelector />
              </Grid>
              {index === searchIndex && (
                <Grid item>
                  <Button variant='contained' size={size} onClick={back} disabled={disableBack} sx={{ px, fontSize: pwaTextFontSize, height: 44 }}>
                    {t('Back')}
                  </Button>
                </Grid>
              )}
              <Grid item>
                <Button variant='contained' size={size} onClick={reset} disabled={disableReset} sx={{ px, fontSize: pwaTextFontSize, height: 44 }}>
                  {(xs && index !== searchIndex) || (xs2 && index === searchIndex) ? t('Restart') : t('Restart Quiz')}
                </Button>
              </Grid>
              {index !== searchIndex && (
                <Grid item>
                  <Button variant='contained' size={size} onClick={search} disabled={disableSearch} sx={{ px, fontSize: pwaTextFontSize, height: 44 }}>
                    {xs2 ? t('Search') : t('Search Now')}
                  </Button>
                </Grid>
              )}
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
