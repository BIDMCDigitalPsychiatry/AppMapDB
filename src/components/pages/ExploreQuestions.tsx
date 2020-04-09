import * as React from 'react';
import { Box, Grid, makeStyles, createStyles, Paper, Divider, Typography, useTheme } from '@material-ui/core';
import DialogButton from '../application/GenericDialog/DialogButton';

import i0 from '../../images/questions/0.png';
import i1 from '../../images/questions/1.png';
import i2 from '../../images/questions/2.png';
import i3 from '../../images/questions/3.png';
import i4 from '../../images/questions/4.png';
import i5 from '../../images/questions/5.png';
import i6 from '../../images/questions/6.png';
import i7 from '../../images/questions/7.png';
import i8 from '../../images/questions/8.png';
import i9 from '../../images/questions/9.png';
import i10 from '../../images/questions/10.png';
import i11 from '../../images/questions/11.png';
import { useFullScreen } from '../../hooks';

const useStyles = makeStyles(() =>
  createStyles({
    root: {},
    button: {
      height: 60,
      width: 240
    }
  })
);

const images = [i0, i1, i2, i3, i4, i5, i6, i7, i8, i9, i10, i11];

export default function ObjecttiveQuestions() {
  const classes = useStyles({});
  const theme = useTheme();
  const [index, setIndex] = React.useState(0);

  const handleNext = React.useCallback(() => setIndex(prev => prev + 1), [setIndex]);
  const handleBack = React.useCallback(() => setIndex(prev => prev - 1), [setIndex]);

  const hidden = !useFullScreen('xs');

  return (
    <>
      <Grid container item xs={12} justify='space-between' alignItems='center' spacing={2}>
        <Grid container item justify='center' xs>
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
        <Grid container item justify='center' xs>
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
      <Grid container item xs={12} justify='space-between' spacing={2}>
        <Grid item>
          <Paper>
            <img style={{ width: '100%' }} src={images[index]} alt={`slide-${index}`} />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
