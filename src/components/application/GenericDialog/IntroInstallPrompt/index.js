import GenericDialog from '../GenericDialog';
import { Box, Button, DialogContent, Grid } from '@mui/material';
import { buttonMinHeight, buttonWidth } from '../../../pwa/Landing';
import IntroInstallStepper from './IntroInstallStepper';
import logo from '../../../../images/mind_logo_new.png';

export const title = 'Try MIND Mobile App!';

const fontSize = 18;

const CloseButton = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      variant='contained'
      size='medium'
      sx={{
        p: 0,
        m: 0,
        //backgroundColor: 'primary.dark',
        //'&:hover': { backgroundColor: 'primary.main' },
        fontSize,
        minHeight: buttonMinHeight,
        fontWeight: 700,
        width: buttonWidth
      }}
    >
      CLOSE
    </Button>
  );
};

export default function IntroInstallPromptDialog({ id = title }) {
  return (
    <GenericDialog id={id} title={id} submitLabel={null} cancelLabel='Close' maxWidth='sm' titleBackgroundColor='primary.main'>
      <DialogContent dividers sx={{ px: 2 }}>
        <Grid container spacing={2} sx={{ my: 2 }}>
          <Grid item xs={12} sx={{ textAlign: 'center' }}>
            <img style={{ height: 64 }} src={logo} alt='logo' />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ fontSize: 28, fontWeight: 700, color: 'text.primary', mb: 2, textAlign: 'center' }}>Try MIND Mobile App!</Box>
          </Grid>
        </Grid>
        <Box sx={{ backgroundColor: '#caeafb', px: 2, py: 2 }}>
          <IntroInstallStepper />
        </Box>
      </DialogContent>
    </GenericDialog>
  );
}
