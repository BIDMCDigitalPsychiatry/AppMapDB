import React from 'react';
import GenericDialog from '../GenericDialog';
import { DialogContent } from '@mui/material';
import Screenshots from './Screenshots';
import { useDialogState } from '../useDialogState';
import { tx } from '../../../../i18n';

export const title = tx('Screenshots');

export default function ScreenshotsDialog({ id = title }) {
  const [{ initialValues = {} }] = useDialogState(id);
  const { images = {} } = initialValues;
  return (
    <>
      <GenericDialog id={id} title={id} submitLabel={null} cancelLabel={tx('Close')} maxWidth='md'>
        <DialogContent dividers>
          <Screenshots images={images} />
        </DialogContent>
      </GenericDialog>
    </>
  );
}
