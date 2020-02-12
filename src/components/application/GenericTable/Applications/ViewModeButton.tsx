import React from 'react';
import * as Icons from '@material-ui/icons';
import { useViewMode } from '../../../layout/store';
import DialogButton from '../../GenericDialog/DialogButton';

export default function ViewModeButton({ mode = 'list' }) {
  const [, setViewMode] = useViewMode() as any;
  const handleClick = React.useCallback(() => setViewMode(mode === 'list' ? 'table' : 'list'), [mode, setViewMode]);
  return (
    <DialogButton Icon={mode === 'list' ? Icons.List : Icons.ViewList} tooltip={`Switch to ${mode === 'list' ? 'Table' : 'List'} View`} onClick={handleClick} />
  );
}
