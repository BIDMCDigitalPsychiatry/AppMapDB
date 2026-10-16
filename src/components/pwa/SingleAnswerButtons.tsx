import * as React from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import { isEmpty } from '../../helpers';
import * as Icons from '@mui/icons-material';
import { usePwaTextFontSize } from './QuestionHeader';
import { useT } from '../../i18n';

const UnselectedButton = ({ label, handleClick }) => {
  const t = useT();
  const pwaTextFontSize = usePwaTextFontSize();
  return (
    <Button variant='contained' onClick={handleClick} size='large' fullWidth sx={{ fontSize: pwaTextFontSize, minHeight: 48 }}>
      {t(label)}
    </Button>
  );
};

const SelectedButton = ({ label, handleClick }) => {
  const t = useT();
  const pwaTextFontSize = usePwaTextFontSize();
  return (
    <Button
      startIcon={<Icons.Check />}
      variant='contained'
      onClick={handleClick}
      size='large'
      fullWidth
      sx={{ backgroundColor: 'primary.dark', fontSize: pwaTextFontSize, minHeight: 48 }}
    >
      {t(label)}
    </Button>
  );
};

const SingleAnswerButtons = ({ value, onChange, onNext, options = [] }) => {
  const t = useT();
  const handleClick = React.useCallback(
    value => () => {
      onChange && onChange(value);
      onNext && onNext();
    },
    [onChange, onNext]
  );
  const pwaTextFontSize = usePwaTextFontSize();

  return (
    <>
      <Box sx={{ color: 'text.secondary', pb: 1 }}>
        <Typography color='text.secondary' fontSize={pwaTextFontSize}>
          {t('Select an option to continue:')}
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {options.map((o, idx) => {
          const label = !isEmpty(o?.label) ? o.label : o;
          return (
            <Grid item xs={12} key={`${label}-${idx}`}>
              {value === o ? (
                <SelectedButton label={!isEmpty(o?.label) ? o.label : o} handleClick={handleClick(o)} />
              ) : (
                <UnselectedButton label={label} handleClick={handleClick(o)} />
              )}
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};

export default SingleAnswerButtons;
