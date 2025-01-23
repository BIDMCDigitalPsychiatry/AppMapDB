import React from 'react';
import GenericDialog from '../GenericDialog';
import { Box, Button, DialogContent, Typography } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { useDialogState } from '../useDialogState';
import { buttonMinHeight, buttonWidth } from '../../../pwa/Landing';

export const title = 'Install To Home Screen';

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
        backgroundColor: 'primary.dark',
        '&:hover': { backgroundColor: 'primary.main' },
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

export default function InstallPromptDialog({ id = title }) {
  const [, setDialogState] = useDialogState(title);
  const handleClose = React.useCallback(() => {
    setDialogState({ open: false });
  }, []);
  return (
    <GenericDialog id={id} title={id} submitLabel={null} cancelLabel='Close' maxWidth='sm' titleBackgroundColor='primary.dark'>
      <DialogContent dividers>
        <Box sx={{ fontSize: 24, fontWeight: 700, color: 'text.primary', mb: 4 }}>Add MINDapps to your home screen!</Box>
        <Box sx={{ display: 'flex', mt: 2 }}>
          <Typography
            sx={{ fontSize, color: 'text.primary', textAlign: 'left', display: 'inline' }}
          >{`1. Press the share symbol at the bottom or top of your screen.`}</Typography>
          <Box sx={{ pt: 0, ml: 0.5, display: 'inline' }}>
            <Icons.IosShare color='text.secondary' sx={{ mx: 0.5 }} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', mt: 2 }}>
          <Typography sx={{ fontSize, color: 'text.primary', textAlign: 'left', display: 'inline' }}>{`2. Select the "Add to Home Screen" option.`}</Typography>
          <Box sx={{ pt: 0, ml: 0.5, display: 'inline' }}>
            <Icons.AddBoxOutlined color='text.secondary' />
          </Box>
        </Box>
        <Box sx={{ fontSize, mt: 2, color: 'text.primary', textAlign: 'left' }}>3. Press “Add” in the top right corner</Box>
        <Box sx={{ fontSize, mt: 4, mb: 3, color: 'text.primary', textAlign: 'center' }}>
          <CloseButton onClick={handleClose} />
        </Box>
      </DialogContent>
    </GenericDialog>
  );
}
