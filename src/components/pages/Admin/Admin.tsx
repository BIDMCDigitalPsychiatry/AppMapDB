import * as React from 'react';
import { useTheme } from '@material-ui/core';
import { useHeaderHeight, useHeight } from '../../layout/store';
import SearchHeaderReduxPending from '../SearchHeaderReduxPending';
import AppsPending from './AppsPending';

export default function Admin() {
  const [showArchived, setShowArchived] = React.useState(false);
  const headerHeight = useHeaderHeight();

  const height = useHeight();
  const { layout } = useTheme() as any;
  const { tablefooterheight } = layout;

  const tableHeight = height - headerHeight + tablefooterheight + 18;

  const handleToggle = React.useCallback(() => {
    setShowArchived(prev => !prev);
  }, [setShowArchived]);
  return (
    <>
      <SearchHeaderReduxPending showArchived={showArchived} onToggleArchive={handleToggle} />
      <AppsPending height={tableHeight} showArchived={showArchived}/>
    </>
  );
}
