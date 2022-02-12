import * as React from 'react';
import RateAnAppHeader from '../RateAnAppHeader';
import { useTheme } from '@mui/material';
import MyAppRatings from './MyAppRatings';
import useHeight from '../../layout/ViewPort/hooks/useHeight';
import useHeaderHeight from '../../layout/ViewPort/hooks/useHeaderHeight';

export default function MyRatings() {
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
      <RateAnAppHeader showArchived={showArchived} onToggleArchive={handleToggle} />
      <MyAppRatings height={tableHeight} showArchived={showArchived} />
    </>
  );
}
