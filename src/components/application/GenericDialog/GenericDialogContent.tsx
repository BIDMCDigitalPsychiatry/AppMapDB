import * as React from 'react';
import { Typography, Box, Grid, Divider, DialogContent } from '@material-ui/core';
import { useFullScreen } from '../../../hooks';

export default function GenericDialogContent({ questions = [], title = '', img = undefined }) {
  const fullScreen = useFullScreen();
  return (
    <DialogContent dividers>
      <Box m={1} ml={fullScreen ? 0 : 2} mr={fullScreen ? 0 : 2}>
        <Grid container alignItems='center' spacing={2}>
          {img && (
            <Grid item style={{ width: 200 }}>
              <Typography>
                <img style={{ width: '80%' }} src={img} alt={title} />
              </Typography>
            </Grid>
          )}
          <Grid item xs>
            <Box mb={1}>
              <Typography variant='h4'>{title}</Typography>
            </Box>
            <Box mb={1}>
              <Divider />
            </Box>
            {questions.map(label => (
              <Box key={label} pt={1} pb={1}>
                <Typography variant='h5'>{label}</Typography>
              </Box>
            ))}
          </Grid>
        </Grid>
      </Box>
    </DialogContent>
  );
}
