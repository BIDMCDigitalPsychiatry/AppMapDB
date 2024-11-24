import * as React from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import { isEmpty } from '../../helpers';
import * as Icons from '@mui/icons-material';

const MultiAnswerButtons = ({ value = [], onChange, onNext, options = [] }) => {
  const handleClick = React.useCallback(
    o => () => {
      if (value?.find(v => v.label === o.label)) {
        onChange && onChange(value.filter(v => v.label !== o.label));
      } else {
        onChange && onChange(value.concat(o));
      }
    },
    [onChange, JSON.stringify(value)]
  );

  return (
    <>
      <Box sx={{ color: 'text.secondary', pb: 1 }}>
        <Typography variant='caption'>Select one or more options. Click done to continue:</Typography>
      </Box>
      <Grid container spacing={2}>
        {options.map(o => {
          const isSelected = value?.find(v => v.label === o.label) ? true : false;
          console.log({ o, isSelected, value });
          return (
            <Grid item xs={12}>
              <Button
                startIcon={isSelected ? <Icons.CheckBox /> : <Icons.CheckBoxOutlineBlank />}
                variant='contained'
                onClick={handleClick(o)}
                size='large'
                fullWidth
                color={isSelected ? 'success' : 'secondary'}
                sx={{ fontSize: 24, minHeight: 64 }}
              >
                {!isEmpty(o?.label) ? o.label : o}
              </Button>
            </Grid>
          );
        })}
        <Grid item xs={12}>
          <Button
            color='primary'
            variant='contained'
            onClick={onNext}
            size='large'
            fullWidth
            sx={{ fontSize: 24, minHeight: 64 }}
            endIcon={<Icons.ArrowForward />}
          >
            Done
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default MultiAnswerButtons;
