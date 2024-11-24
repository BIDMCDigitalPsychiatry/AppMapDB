import * as React from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import { isEmpty } from '../../helpers';

const SingleAnswerButtons = ({ value, onChange, onNext, options = [] }) => {
  const handleClick = React.useCallback(
    value => () => {
      onChange && onChange(value);
      onNext && onNext();
    },
    [onChange, onNext]
  );

  return (
    <>
      <Box sx={{ color: 'text.secondary', pb: 1 }}>
        <Typography variant='caption'>Select an option to continue:</Typography>
      </Box>
      <Grid container spacing={2}>
        {options.map(o => (
          <Grid item xs={12}>
            <Button
              variant='contained'
              onClick={handleClick(o)}
              size='large'
              fullWidth
              sx={{ backgroundColor: value === o ? 'primary.dark' : undefined, fontSize: 24, minHeight: 64 }}
            >
              {!isEmpty(o?.label) ? o.label : o}
            </Button>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default SingleAnswerButtons;
