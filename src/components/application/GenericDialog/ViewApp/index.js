import GenericDialog from '../GenericDialog';
import { DialogContent } from '@mui/material';
import { useDialogState } from '../useDialogState';
import { ViewAppContent } from '../../../pages/ViewApp';

export const title = 'View App';

export default function ViewAppDialog({ id = title }) {
  const [{ open, app, from }] = useDialogState(title);

  return (
    <GenericDialog id={id} title={id} submitLabel={null} cancelLabel='Close' fullScreen={true}>
      <DialogContent dividers sx={{ p: 0, m: 0 }}>
        {open && <ViewAppContent app={app} from={from} />}
      </DialogContent>
    </GenericDialog>
  );
}
