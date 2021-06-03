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
            { label: 'Cover Default', value: '/images/covers/cover_default.jpg' },
            { label: 'Cover 1', value: '/images/covers/cover_1.jpg' },
            { label: 'Cover 2', value: '/images/covers/cover_2.jpg' },
            { label: 'Cover 3', value: '/images/covers/cover_3.jpg' },
            { label: 'Cover 4', value: '/images/covers/cover_4.jpg' },
            { label: 'Cover 5', value: '/images/covers/cover_5.jpg' },
            { label: 'Cover 6', value: '/images/covers/cover_6.jpg' },
            { label: 'Cover 7', value: '/images/covers/cover_7.jpg' },            
            { label: 'Cover 9', value: '/images/covers/cover_9.jpg' },
            { label: 'Cover 10', value: '/images/covers/cover_10.jpg' },
            { label: 'Cover 11', value: '/images/covers/cover_11.jpg' },
            { label: 'Cover 12', value: '/images/covers/cover_12.jpg' },
            { label: 'Cover 13', value: '/images/covers/cover_13.jpg' }
          ]
        }
      ]}
    />
  );
}
