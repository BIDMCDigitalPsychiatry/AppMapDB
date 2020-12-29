import * as React from 'react';
import { useTheme } from '@material-ui/core';
import { useHeaderHeight, useHeight } from '../../layout/store';
import SearchHeaderRedux from '../SearchHeaderRedux';
import AppsPending from './AppsPending';

export default function Admin() {
  const headerHeight = useHeaderHeight();

  const height = useHeight();
  const { layout } = useTheme() as any;
  const { tablefooterheight } = layout;

  const tableHeight = height - headerHeight + tablefooterheight + 18;
  return (
    <>
      <SearchHeaderRedux title='Pending Approvals' />
      <AppsPending height={tableHeight}/>
    </>
  );
}
