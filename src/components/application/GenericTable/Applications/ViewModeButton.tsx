import React from 'react';
import * as Icons from '@mui/icons-material';
import { useViewMode } from '../../../layout/store';
import { Fab, Tooltip } from '@mui/material';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

const useStyles = makeStyles(({ spacing }: any) =>
  createStyles({
    viewmode: {
      position: 'absolute',
      bottom: spacing(9),
      right: spacing(3),
      zIndex: 999999
    }
  })
);

export default function ViewModeButton({ mode = 'grid' }) {
  const classes = useStyles();
  const [, setViewMode] = useViewMode() as any;
  const handleClick = React.useCallback(() => setViewMode(mode === 'grid' ? 'table' : 'grid'), [mode, setViewMode]);
  const tooltip = `Switch to ${mode === 'grid' ? 'Table' : 'Grid'} View`;
  const Icon = mode === 'grid' ? Icons.List : Icons.HorizontalSplit;
  return (
    <Tooltip title={tooltip} placement='left'>
      <Fab className={classes.viewmode} size='large' color='primary' aria-label='view-mode' onClick={handleClick}>
        <Icon />
      </Fab>
    </Tooltip>
  );
}
