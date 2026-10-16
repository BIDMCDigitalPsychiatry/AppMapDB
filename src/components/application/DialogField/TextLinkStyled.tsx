import * as React from 'react';
import { TextField, InputAdornment, IconButton, Tooltip } from '@mui/material';
import { isEmpty, isError } from '../../../helpers';
import * as Icons from '@mui/icons-material';
import { useHandleLink } from '../../../hooks';
import { useT } from '../../../i18n';

const TextLinkStyled = ({
  value = '',
  margin = 'dense',
  variant = 'outlined',
  forceErrorMargin = false,
  error = undefined,
  initialValue = undefined,
  InputProps = undefined,
  disabled = undefined,
  label = undefined,
  placeholder = undefined,
  helperText = undefined,
  fullWidth = undefined,
  ...other
}) => {
  const t = useT();
  const handleMouseDown = event => {
    event.preventDefault();
  };

  const handleLink = useHandleLink(value);

  return (
    <TextField
      value={value}
      error={isError(error)}
      helperText={forceErrorMargin ? t(error) || ' ' : t(error)} // Forces a constant helper text margin
      margin={margin as any}
      variant={variant as any}
      fullWidth={fullWidth}
      style={{ width: 500 - 8 }}
      InputLabelProps={{
        shrink: true
      }}
      InputProps={{
        endAdornment: (
          <Tooltip title={t('Click to open')}>
            <InputAdornment position='end'>
              <IconButton
                disabled={isEmpty(value)}
                aria-label='open-link'
                onClick={handleLink}
                onMouseDown={handleMouseDown}
                edge='end'
                size="large">
                <Icons.Link />
              </IconButton>
            </InputAdornment>
          </Tooltip>
        ),
        ...InputProps
      }}
      disabled={disabled}
      {...(label !== undefined ? { label: t(label) } : {})}
      {...(placeholder !== undefined ? { placeholder: t(placeholder) } : {})}
      {...(helperText !== undefined ? { helperText: t(helperText) } : {})}
      {...other}
    />
  );
};

export default TextLinkStyled;
