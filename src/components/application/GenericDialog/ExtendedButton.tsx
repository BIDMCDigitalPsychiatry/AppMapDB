import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Tooltip, Grid, Typography, Fab, useTheme } from '@mui/material';

const ExtendedButton = ({
  onClick = undefined,
  text = undefined,
  Icon = AddIcon,
  color = 'primary' as 'primary',
  size = 'small' as 'small',
  variant = 'extended' as 'extended',
  tooltip = 'Process',
  placement = 'bottom',
  disabled = false,
  setDisabledColor = true,
  fullWidth = false,
  noGrid = true
}) => {
  const theme = useTheme();
  const wrapGrid = Component =>
    noGrid ? (
      Component
    ) : (
      <Grid key={`extended-${text}-${tooltip}`} item style={{ width: fullWidth ? '100%' : undefined }}>
        {Component}
      </Grid>
    );
  return wrapGrid(
    <Tooltip
      placement={placement as any}
      title={
        <Typography variant='h6' color='inherit'>
          {tooltip}
        </Typography>
      }
    >
      <span>
        <Fab
          size={size}
          variant={variant}
          color={color}
          disabled={disabled}
          onClick={onClick}
          style={{
            color: disabled && setDisabledColor ? theme.palette.primary.light : theme.palette.common.white,
            width: fullWidth ? '100%' : undefined
          }}
        >
          <Grid container justifyContent='space-between' alignItems='center'>
            <Grid item>
              <Icon style={{ marginBottom: -4 }} />
            </Grid>
            <Grid item xs>
              {text && (
                <Typography style={{ paddingLeft: 4, paddingRight: 8 }} align='center'>
                  {text}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Fab>
      </span>
    </Tooltip>
  );
};

export default ExtendedButton;
