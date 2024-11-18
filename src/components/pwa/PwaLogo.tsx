import { Grid } from '@mui/material';
import logo from '../../images/logoV2.png';

export default function PwaLogo() {
  return (
    <Grid container alignItems='center'>
      <Grid item>
        <img src={logo} alt='logo' />
      </Grid>
    </Grid>
  );
}
