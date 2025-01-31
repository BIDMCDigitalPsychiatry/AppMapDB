import { Grid } from '@mui/material';
import logo from '../../images/mind_logo_new.png';

export default function PwaLogo() {
  return (
    <Grid container alignItems='center'>
      <Grid item>
        <img src={logo} alt='logo' style={{ maxHeight: 36 }} />
      </Grid>
    </Grid>
  );
}
