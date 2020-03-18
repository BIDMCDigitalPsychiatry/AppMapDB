import React from 'react';
import * as Icons from '@material-ui/icons';
import { useViewMode } from '../../../layout/store';
import DialogButton from '../../GenericDialog/DialogButton';
import { useFullScreen } from '../../../../hooks';

export default function ViewModeButton({ mode = 'list' }) {
  const [, setViewMode] = useViewMode() as any;
  const handleClick = React.useCallback(() => setViewMode(mode === 'list' ? 'table' : 'list'), [mode, setViewMode]);
  const fullScreen = useFullScreen();
  return (
    <DialogButton Icon={mode === 'list' ? Icons.List : Icons.ViewList} tooltip={`Switch to ${mode === 'list' ? 'Table' : 'List'} View`} onClick={handleClick}>
      {!fullScreen && 'Toggle View'}
    </DialogButton>
  );
}
