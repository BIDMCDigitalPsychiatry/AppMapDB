import React from 'react';
import GenericDialog from '../GenericDialog';
import { Box, Button, DialogContent, Typography } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { useDialogState } from '../useDialogState';
import { buttonMinHeight, buttonWidth } from '../../../pwa/Landing';
import InstallStepper from './InstallStepper';
import { useT, tx } from '../../../../i18n';

export const title = tx('Install To Home Screen');

const fontSize = 18;

const CloseButton = ({ onClick }) => {
  const t = useT();
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
      {t('CLOSE')}
    </Button>
  );
};

export default function InstallPromptDialog({ id = title }) {
  const [, setDialogState] = useDialogState(title);
  const t = useT();
  const handleClose = React.useCallback(() => {
    setDialogState({ open: false });
  }, []);
  return (
    <GenericDialog id={id} title={id} submitLabel={null} cancelLabel={tx('Close')} maxWidth='sm' titleBackgroundColor='primary.dark'>
      <DialogContent dividers>
        <Box sx={{ fontSize: 24, fontWeight: 700, color: 'text.primary', mb: 4 }}>{t('Add MINDapps to your home screen!')}</Box>
        <InstallStepper />
        <Box sx={{ fontSize, mt: 4, mb: 3, color: 'text.primary', textAlign: 'center' }}>
          <CloseButton onClick={handleClose} />
        </Box>
      </DialogContent>
    </GenericDialog>
  );
}
