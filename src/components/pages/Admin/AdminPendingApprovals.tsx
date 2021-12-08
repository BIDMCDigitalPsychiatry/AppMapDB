import * as React from 'react';
import SearchHeaderReduxPending from '../SearchHeaderReduxPending';
import AppsPending from './AppsPending';

export default function AdminPendingApprovals({ height }) {
  const [showArchived, setShowArchived] = React.useState(false);

  const handleToggle = React.useCallback(() => {
    setShowArchived(prev => !prev);
  }, [setShowArchived]);
  return (
    <>
      <SearchHeaderReduxPending showArchived={showArchived} onToggleArchive={handleToggle} />
      <AppsPending height={height} showArchived={showArchived} />
    </>
  );
}
