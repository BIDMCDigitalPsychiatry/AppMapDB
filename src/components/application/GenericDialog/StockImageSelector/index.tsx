import React from 'react';
import ImageList from '../../DialogField/ImageList';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../useDialogState';
import { tx, useT } from '../../../../i18n';

// Dialog id (stays English); GenericDialog translates it for display.
export const title = tx('Stock Image Selector');

const handleValidation = () => {
  var errors = {};
  return errors;
};

export default function StockImageSelectorDialog({ id = title, onChange = undefined }) {
  const [, setState] = useDialogState(id);
  const t = useT();
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
      submitLabel={t('Select Image')}
      maxWidth='xl'
      fields={[
        {
          id: 'image',
          label: t('Select desired image:'),
          required: true,
          Field: ImageList,
          items: [
            { label: t('Cover Default'), value: '/images/covers/cover_default.jpg' },
            { label: t('Cover {{number}}', { number: 1 }), value: '/images/covers/cover_1.jpg' },
            { label: t('Cover {{number}}', { number: 2 }), value: '/images/covers/cover_2.jpg' },
            { label: t('Cover {{number}}', { number: 3 }), value: '/images/covers/cover_3.jpg' },
            { label: t('Cover {{number}}', { number: 4 }), value: '/images/covers/cover_4.jpg' },
            { label: t('Cover {{number}}', { number: 5 }), value: '/images/covers/cover_5.jpg' },
            { label: t('Cover {{number}}', { number: 6 }), value: '/images/covers/cover_6.jpg' },
            { label: t('Cover {{number}}', { number: 7 }), value: '/images/covers/cover_7.jpg' },            
            { label: t('Cover {{number}}', { number: 9 }), value: '/images/covers/cover_9.jpg' },
            { label: t('Cover {{number}}', { number: 10 }), value: '/images/covers/cover_10.jpg' },
            { label: t('Cover {{number}}', { number: 11 }), value: '/images/covers/cover_11.jpg' },
            { label: t('Cover {{number}}', { number: 12 }), value: '/images/covers/cover_12.jpg' },
            { label: t('Cover {{number}}', { number: 13 }), value: '/images/covers/cover_13.jpg' }
          ]
        }
      ]}
    />
  );
}
