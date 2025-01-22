import React from 'react';
import GenericDialog from '../GenericDialog';
import { Box, Button, DialogContent, Typography } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { useDialogState } from '../useDialogState';

export const title = 'Install To Home Screen';

export default function InstallPromptDialog({ id = title }) {
  const [, setDialogState] = useDialogState(title);
  const handleClose = React.useCallback(() => {
    setDialogState({ open: false });
  }, []);
  return (
    <GenericDialog id={id} title={id} submitLabel={null} cancelLabel='Close' maxWidth='sm'>
      <DialogContent dividers>
        <Box sx={{ fontSize: 24, fontWeight: 700, color: 'text.primary', textAlign: 'center', mb: 4 }}>Add MINDapps to your home screen!</Box>
        <Box sx={{ display: 'flex', mt: 2 }}>
          <Typography
            sx={{ fontSize: 15, color: 'text.primary', textAlign: 'left', display: 'inline' }}
          >{`1. Press the share symbol at the bottom or top of your screen.`}</Typography>
          <Box sx={{ pt: 0, ml: 0.5, display: 'inline' }}>
            <Icons.IosShare color='text.secondary' sx={{ mx: 0.5 }} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', mt: 2 }}>
          <Typography
            sx={{ fontSize: 15, color: 'text.primary', textAlign: 'left', display: 'inline' }}
          >{`2. Select the "Add to Home Screen" option.`}</Typography>
          <Box sx={{ pt: 0, ml: 0.5, display: 'inline' }}>
            <Icons.AddBoxOutlined color='text.secondary' />
          </Box>
        </Box>
        <Box sx={{ fontSize: 15, mt: 2, color: 'text.primary', textAlign: 'left' }}>3. Press “Add” in the top right corner</Box>
        <Box sx={{ fontSize: 15, mt: 3, mb: 2, color: 'text.primary', textAlign: 'center' }}>
          <Button variant='contained' onClick={handleClose}>
            Close
          </Button>
        </Box>
      </DialogContent>
    </GenericDialog>
  );
}
