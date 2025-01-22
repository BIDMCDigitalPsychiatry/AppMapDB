import GenericDialog from '../GenericDialog';
import { Grid, Box, DialogContent } from '@mui/material';
import * as Icons from '@mui/icons-material';

export const title = 'Install To Home Screen';

export default function InstallPromptDialog({ id = title }) {
  return (
    <GenericDialog id={id} title={id} submitLabel={null} cancelLabel='Close' maxWidth='sm'>
      <DialogContent dividers>
        <Box sx={{ fontSize: 24, fontWeight: 700, color: 'text.primary', textAlign: 'center' }}>Add MINDapps to your home screen!</Box>
        <Grid container spacing={1} alignItems='center' sx={{ mt: 1 }}>
          <Grid item>
            <Box sx={{ fontSize: 15, pt: 2, color: 'text.primary', textAlign: 'left', display: 'inline' }}>{`1. Press the share symbol`}</Box>
          </Grid>
          <Grid item>
            <Icons.IosShare color='text.secondary' />
          </Grid>
          <Grid item>
            <Box sx={{ fontSize: 15, pt: 2, color: 'text.primary', textAlign: 'left', display: 'inline' }}>{`at the bottom (or top) of your screen.`}</Box>
          </Grid>
        </Grid>
        <Box sx={{ fontSize: 15, pt: 2, color: 'text.primary', textAlign: 'left' }}>2. Select “Add to Home Screen”</Box>
        <Box sx={{ fontSize: 15, pt: 2, color: 'text.primary', textAlign: 'left' }}>3. Press “Add” in the top right corner</Box>
      </DialogContent>
    </GenericDialog>
  );
}
