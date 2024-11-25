import { Grid, Divider, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from '../../store';
import Progress from './Progress';
import { getQuestion } from './questions';

export default function QuestionHeader() {
  const index = useSelector((s: AppState) => s.pwa.index);
  const { label } = getQuestion(index);

  return (
    <Grid container spacing={0} alignItems='center' justifyContent='center' sx={{ px: 0, pt: 0 }}>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ px: 2, py: 1 }}>
          <Progress />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12} sx={{ textAlign: 'center', fontSize: 28, color: 'primary.dark' }}>
        <Box sx={{ px: 2 }}>{label}</Box>
      </Grid>
    </Grid>
  );
}
