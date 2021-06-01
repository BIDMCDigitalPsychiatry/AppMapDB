import React from 'react';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../useDialogState';
import useProcessData from '../../../../database/useProcessData';
import { tables } from '../../../../database/dbConfig';
import { uuid } from '../../../../helpers';
import { useUserId } from '../../../layout/hooks';

export const title = 'Comment';
const Model = tables.comments;

export default function CommentDialog({ id = title, onClose }) {
  const userId = useUserId();

  const [{ type }, setState] = useDialogState(id);
  const handleClose = React.useCallback(() => {
    setState(prev => ({ ...prev, open: false, loading: false }));
    onClose && onClose();
  }, [onClose, setState]);

  const processData = useProcessData();

  const handleSubmit = React.useCallback(
    values => {
      setState(prev => ({ ...prev, loading: true }));

      const Data =
        type === 'Add'
          ? { ...values, _id: uuid(), createdBy: userId, createdAt: new Date().getTime() }
          : { ...values, updatedBy: userId, updatedAt: new Date().getTime() };

      processData({
        Model,
        Action: 'u',
        Data,
        onError: () => setState(prev => ({ ...prev, loading: false, error: 'Error submitting values' })),
        onSuccess: () => handleClose()
      });
    },
    [setState, processData, userId, type, handleClose]
  );

  return (
    <GenericDialog
      id={id}
      title={id}
      onSubmit={handleSubmit}
      submitLabel='Add'
      onClose={onClose}
      fields={[
        {
          id: '_id',
          hidden: true
        },
        {
          id: 'postId',
          hidden: true
        },
        {
          id: 'authorName',
          label: 'Author Name',
          required: true
        },
        {
          id: 'content',
          label: 'Comment',
          multiline: true,
          rows: 4
        }
      ]}
    />
  );
}
