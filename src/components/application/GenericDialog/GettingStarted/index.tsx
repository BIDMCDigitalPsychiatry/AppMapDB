import React from 'react';
import GenericDialog from '../GenericDialog';
import { DialogContent, Typography } from '@material-ui/core';
import ReactPlayer from 'react-player';

export const title = 'Getting Started';

const Content = () => {
  return (
    <DialogContent>
      <Typography variant='h6'>Welcome!</Typography>
      <Typography variant='body2' style={{ marginTop: 8 }}>
        If you need help getting started, please take a minute to review the video below:
      </Typography>

      <div style={{ marginTop: 16 }}>
        <ReactPlayer width='100%' url='https://www.youtube.com/watch?v=nLF0n9SACd4' controls />
      </div>
    </DialogContent>
  );
};

export default function GettingStartedDialog({ id = title, onClose, ...other }) {
  return (
    <GenericDialog
      id={id}
      maxWidth='sm'
      title={title}
      onClose={onClose}
      submitLabel={null}
      cancelLabel='Close'
      Content={Content}
      {...other}
    />
  );
}
