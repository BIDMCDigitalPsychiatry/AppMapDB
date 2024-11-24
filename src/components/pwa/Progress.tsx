import { Grid, LinearProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from '../../store';
import { questions } from './questions';

export default function Progress() {
  const index = useSelector((s: AppState) => s.pwa.index);
  var progress = (100 * (index + 1)) / questions?.length;

  return (
    <Grid container spacing={1} alignItems='center'>
      <Grid item xs>
        <LinearProgress value={progress} variant='determinate' sx={{ height: 12, borderRadius: 5 }} />
      </Grid>
      <Grid item sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
        {index + 1} / {questions.length}
      </Grid>
    </Grid>
  );
}
