import * as React from 'react';
import { Box, Grid, Paper, Divider, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import DialogButton from '../../../application/GenericDialog/DialogButton';

import { useFullScreen } from '../../../../hooks';

const useStyles = makeStyles(() =>
  createStyles({
    root: {},
    button: {
      height: 60,
      width: 240
    }
  })
);

export default function Screenshots({ images }) {
  const classes = useStyles({});
  const theme = useTheme();
  const [index, setIndex] = React.useState(0);

  const handleNext = React.useCallback(() => setIndex(prev => prev + 1), [setIndex]);
  const handleBack = React.useCallback(() => setIndex(prev => prev - 1), [setIndex]);

  const hidden = !useFullScreen('xs');

  return <>
    <Grid container item xs={12} justifyContent='space-between' alignItems='center' spacing={2}>
      <Grid container item justifyContent='center' xs>
        <DialogButton
          disabled={index <= 0 ? true : false}
          className={classes.button}
          size='large'
          variant='outlined'
          tooltip='Click to View Previous'
          Icon={null}
          onClick={handleBack}
          disabledColor={theme.palette.text.disabled}
        >
          Back
        </DialogButton>
      </Grid>
      {hidden && (
        <Grid item xs>
          <Typography align='center' color='textSecondary'>
            {index + 1} of {images.length}
          </Typography>
        </Grid>
      )}
      <Grid container item justifyContent='center' xs>
        <DialogButton
          disabled={index >= images.length - 1 ? true : false}
          className={classes.button}
          size='large'
          variant='outlined'
          tooltip='Click to View Next'
          Icon={null}
          onClick={handleNext}
          disabledColor={theme.palette.text.disabled}
        >
          Next
        </DialogButton>
      </Grid>
    </Grid>
    <Box mt={2} mb={2}>
      <Divider />
    </Box>
    <Grid container item xs={12} justifyContent='center'>
      <Grid item>
        <Paper>
          <img style={{ width: '100%' }} src={images[index]} alt={`slide-${index}`} />
        </Paper>
      </Grid>
    </Grid>
  </>;
}
