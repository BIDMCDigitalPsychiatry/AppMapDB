import * as React from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import { isEmpty } from '../../helpers';
import * as Icons from '@mui/icons-material';
import { usePwaTextFontSize } from './QuestionHeader';
import ButtonGroup from '@mui/material/ButtonGroup';

const MultiAnswerButtons = ({ value = [], onChange, onNext, options = [] }) => {
  const handleClick = React.useCallback(
    o => () => {
      if (value?.find(v => v.label === o.label)) {
        onChange && onChange([...value.filter(v => v.label !== o.label)]);
      } else {
        onChange && onChange([...value.concat(o)]);
      }
    },
    // eslint-disable-next-line
    [onChange, JSON.stringify(value)]
  );

  const pwaTextFontSize = usePwaTextFontSize();

  return (
    <>
      <Box sx={{ color: 'text.secondary', pb: 1 }}>
        <Typography fontSize={pwaTextFontSize}>Select one or more options. Click done to continue:</Typography>
      </Box>
      <Grid container spacing={2}>
        {options.map((o, idx) => {
          const isSelected = value?.find(v => v.label === o.label) ? true : false;
          return (
            <Grid item xs={12} key={`${idx}-${isSelected}`}>
              <ButtonGroup aria-label='Button group with select' fullWidth>
                <Button
                  size='small'
                  aria-label='select button option'
                  onClick={handleClick(o)}
                  color='primary'
                  fullWidth={false}
                  sx={{
                    fontSize: pwaTextFontSize,
                    minHeight: 48,
                    color: 'white',
                    backgroundColor: isSelected ? 'primary.dark' : 'primary.main',
                    '&:hover': {
                      backgroundColor: isSelected ? 'primary.dark' : 'primary.main'
                    }
                  }}
                >
                  {isSelected ? <Icons.CheckBox /> : <Icons.CheckBoxOutlineBlank />}
                </Button>
                <Button
                  disableElevation={true}
                  variant='contained'
                  onClick={handleClick(o)}
                  size='large'
                  fullWidth
                  color='primary'
                  sx={{
                    pr: 7,
                    textAlign: 'left',
                    fontSize: pwaTextFontSize,
                    minHeight: 48,
                    backgroundColor: isSelected ? 'primary.dark' : 'primary.main',
                    '&:hover': {
                      backgroundColor: isSelected ? 'primary.dark' : 'primary.main'
                    }
                  }}
                >
                  {!isEmpty(o?.label) ? o.label : o}
                </Button>
              </ButtonGroup>
            </Grid>
          );
        })}
        <Grid item xs={12}>
          <Button
            color='primary'
            variant='contained'
            onClick={onNext}
            fullWidth
            sx={{ fontSize: pwaTextFontSize, minHeight: 48 }}
            endIcon={<Icons.ArrowForward />}
          >
            Next
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default MultiAnswerButtons;
