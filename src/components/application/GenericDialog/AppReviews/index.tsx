import React from 'react';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../useDialogState';
import { useAppRatings } from '../../../../database/useRatings';
import { DialogContent, Grid } from '@material-ui/core';
import { useApp } from '../../../../database/useApplications';
import Application from '../../../../database/models/Application';
import RatingCard from './RatingCard';
import { sortDescending } from '../../../../helpers';

export const title = 'Application Reviews';

export default function Reviews({ id = title, onClose, ...other }) {
  const [{ initialValues }] = useDialogState(id);
  const { _id } = initialValues;
  const ratings = useAppRatings(_id);
  const app: Application = useApp(_id);

  return (
    <GenericDialog id={id} title={`Reviews - ${app?.name}`} onClose={onClose} submitLabel={null} cancelLabel={'Close'} {...other}>
      <DialogContent>
        <Grid container spacing={1}>
          {ratings
            .sort(({ time: t1 }, { time: t2 }) => sortDescending(t1, t2))
            .map((r, i) => (
              <Grid item xs={12} key={i}>
                <RatingCard {...r} />
              </Grid>
            ))}
        </Grid>
      </DialogContent>
    </GenericDialog>
  );
}
