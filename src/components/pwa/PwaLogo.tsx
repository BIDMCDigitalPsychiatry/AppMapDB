import { Grid } from '@mui/material';
import logo from '../../images/MIND_logo.svg';

export default function PwaLogo() {
  return (
    <Grid container alignItems='center'>
      <Grid item>
        <img src={logo} alt='logo' style={{ maxHeight: 38 }} />
      </Grid>
    </Grid>
  );
}
