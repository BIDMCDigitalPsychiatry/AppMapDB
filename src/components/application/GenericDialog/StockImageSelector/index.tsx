import React from 'react';
import ImageList from '../../DialogField/ImageList';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../useDialogState';

export const title = 'Stock Image Selector';

const handleValidation = () => {
  var errors = {};
  return errors;
};

export default function StockImageSelectorDialog({ id = title, onChange = undefined }) {
  const [, setState] = useDialogState(id);
  const handleSelect = React.useCallback(
    values => {
      setState(prev => ({ ...prev, open: false }));
      onChange && onChange(values?.image);
    },
    [setState, onChange]
  );

  return (
    <GenericDialog
      id={id}
      title={id}
      onSubmit={handleSelect}
      validate={handleValidation}
      submitLabel={'Select Image'}
      maxWidth='xl'
      fields={[
        {
          id: 'image',
          label: 'Select desired image:',
          required: true,
          Field: ImageList,
          items: [
            { label: 'Cover 1', value: '/static/mock-images/covers/cover_1.jpg' },
            { label: 'Cover 2', value: '/static/mock-images/covers/cover_2.jpg' },
            { label: 'Cover 3', value: '/static/mock-images/covers/cover_3.jpg' },
            { label: 'Cover 4', value: '/static/mock-images/covers/cover_4.jpg' },
            { label: 'Cover 5', value: '/static/mock-images/covers/cover_5.jpg' },
            { label: 'Cover 6', value: '/static/mock-images/covers/cover_6.jpg' },
            { label: 'Cover 7', value: '/static/mock-images/covers/cover_7.jpg' }
          ]
        }
      ]}
    />
  );
}
