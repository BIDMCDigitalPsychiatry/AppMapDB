import { Button, Grid, LinearProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from '../../store';
import { questions } from './questions';
import { usePwaActions } from './store';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import useWidth from '../layout/ViewPort/hooks/useWidth';
import { usePwaTextFontSize } from './QuestionHeader';

export default function Progress() {
  const index = useSelector((s: AppState) => s.pwa.index);
  var progress = (100 * (index + 1)) / questions?.length;
  const { back, next } = usePwaActions();

  const width = useWidth();
  const size = width < 350 ? 'medium' : 'large';

  const pwaTextFontSize = usePwaTextFontSize();

  return (
    <Grid container spacing={1} alignItems='center'>
      <Grid item xs={12}>
        <LinearProgress value={progress} variant='determinate' sx={{ height: 12, borderRadius: 5 }} />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={0.25} alignItems='center' justifyContent='space-between'>
          <Grid item>
            <Button variant='contained' size={size} onClick={back} startIcon={<KeyboardArrowLeft />} sx={{ fontSize: pwaTextFontSize, height: 44 }}>
              Back
            </Button>
          </Grid>
          <Grid item sx={{ color: 'text.secondary', fontSize: pwaTextFontSize }}>
            Question {index + 1}/{questions.length}
          </Grid>

          <Grid item>
            <Button variant='contained' size={size} onClick={next} endIcon={<KeyboardArrowRight />} sx={{ fontSize: pwaTextFontSize, height: 44 }}>
              Next
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
