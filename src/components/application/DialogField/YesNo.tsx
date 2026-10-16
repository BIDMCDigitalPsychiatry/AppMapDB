import * as React from 'react';
import { FormControl, FormHelperText, Grid, Typography, ButtonGroup, Button } from '@mui/material';
import { isError, isTrue, isFalse } from '../../../helpers';
import { useT } from '../../../i18n';
import * as Icons from '@mui/icons-material';
import LightTooltip from '../../general/LightTooltip/LightTooltip';

const YesNo = ({
  label = '',
  variant = undefined,
  size = 'small' as 'small',
  color = 'primary' as 'primary',
  error = undefined,
  value = undefined,
  tooltip = undefined,
  margin = 'dense' as 'dense',
  labelPlacement = 'start',
  onChange = undefined,
  forceErrorMargin = false,
  type = undefined, // Don't pass an undefined type to Checkbox.  This filters the prop out
  initialValue = undefined,
  ...other
}) => {
  const t = useT();
  const handleChange = React.useCallback(value => () => onChange && onChange({ target: { value } }), [onChange]);

  const Label = (
    <Grid item>
      <Typography variant='body2'>{t(label)}</Typography>
    </Grid>
  );

  return (
    <FormControl variant={variant} error={isError(error)} fullWidth={true} margin={margin}>
      <Grid container justifyContent='space-between' alignItems='center' spacing={3}>
        {labelPlacement === 'start' && Label}
        <Grid item>
          <Grid container justifyContent='flex-end' alignItems='center' spacing={1}>
            {tooltip && (
              <Grid item>
                <LightTooltip title={t(tooltip)}>
                  <Icons.HelpOutlined fontSize='small' color='primary' />
                </LightTooltip>
              </Grid>
            )}
            <Grid item>
              <ButtonGroup size={size} color={color} aria-label={`${label}-button-group`} {...other}>
                <Button variant={isTrue(value) ? 'contained' : undefined} onClick={handleChange(true)}>
                  {t('Yes')}
                </Button>
                <Button variant={isFalse(value) ? 'contained' : undefined} onClick={handleChange(false)}>
                  {t('No')}
                </Button>
              </ButtonGroup>
            </Grid>
          </Grid>
        </Grid>
        {labelPlacement === 'end' && Label}
      </Grid>
      {(forceErrorMargin || error) && <FormHelperText>{t(error)}</FormHelperText>}
    </FormControl>
  );
};

export default YesNo;
