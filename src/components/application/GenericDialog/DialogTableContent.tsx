import React from 'react';
import { useTheme, useMediaQuery } from '@material-ui/core';
import useHeight from '../../layout/ViewPort/hooks/useHeight';

const DialogTableContent = ({ Table, breakpoint = 'sm' as any, inProgress, toolbar = true, square = true, elevation = 0, ...other }) => {
  const theme = useTheme();
  var height = useHeight() - (toolbar ? 0 : 44) - 48 + 130; // Heights for the dialog header and footer
  const fullScreen = useMediaQuery(theme.breakpoints.down(breakpoint));

  return (
    <div
      style={{
        height: fullScreen && '100%',
        overflowX: 'hidden',
        overflowY: fullScreen ? 'hidden' : 'hidden',
        display: 'fixed',
        //borderTop: `1px solid ${theme.palette.divider}`,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
    >
      <Table loading={inProgress} height={fullScreen ? height : height * 0.9} elevation={elevation} square={square} toolbar={toolbar} {...other} />
    </div>
  );
};

export default DialogTableContent;
