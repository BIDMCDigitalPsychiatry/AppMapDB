import React from 'react';
import { useTheme, useMediaQuery } from '@material-ui/core';
import * as LayoutStore from '../../layout/store';

const DialogTableContent = ({ Table, breakpoint = 'sm' as any, toolbar = true, square = true, elevation = 0, isStepper = false, ...other }) => {
  const theme = useTheme();
  var height = LayoutStore.useHeight() - (toolbar ? 0 : 44) - 48 - (isStepper ? 148 : 0); // Heights for the dialog header and footer
  const fullScreen = useMediaQuery(theme.breakpoints.down(breakpoint));

  return (
    <div
      style={{
        height: fullScreen && '100%',
        overflowX: 'hidden',
        overflowY: fullScreen ? 'hidden' : 'auto',
        display: 'fixed',
        //borderTop: `1px solid ${theme.palette.divider}`,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
    >
      <Table height={fullScreen ? height : 400} elevation={elevation} square={square} toolbar={toolbar} {...other} />
    </div>
  );
};

export default DialogTableContent;
