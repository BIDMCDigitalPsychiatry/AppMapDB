import GenericDialog from '../GenericDialog';
import { Box, DialogContent } from '@mui/material';
import { useDialogState } from '../useDialogState';
import IntroVideo from '../../../layout/IntroVideo';
import { useTourCompleted } from '../../../layout/hooks';

export const title = 'Welcome Video';

export default function IntroVideoDialog({ id = title }) {
  const [{ open }] = useDialogState(title);
  const { setTourCompleted } = useTourCompleted();
  const handleClose = () => setTourCompleted(true);

  return (
    <GenericDialog id={id} title={id} submitLabel={null} cancelLabel='Close' maxWidth='sm' onClose={handleClose}>
      <DialogContent dividers>
        <Box sx={{ fontSize: 24, fontWeight: 700, color: 'text.primary', textAlign: 'center' }}>Welcome!</Box>
        <Box sx={{ fontSize: 15, pt: 1, color: 'text.primary', textAlign: 'center' }}>
          Please review this instructional video for information regarding this website.
        </Box>
        {open && <IntroVideo />}
      </DialogContent>
    </GenericDialog>
  );
}
