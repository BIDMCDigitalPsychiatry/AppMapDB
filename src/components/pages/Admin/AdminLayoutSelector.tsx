import { useTheme } from '@material-ui/core';
import * as React from 'react';
import TabSelectorTextToolBar from '../../general/TabSelector/TabSelectorTextToolBar';

const tabs = [
  { id: 'Pending Approvals', route: '/Admin', routeState: { adminLayout: 'pending' } },
  { id: 'Surveys', route: '/Admin', routeState: { adminLayout: 'surveys' } }
].filter(t => t);

const AdminLayoutSelector = props => {
  const { palette } = useTheme();
  return <TabSelectorTextToolBar id='AdminLayoutSelector' labelColor={palette.primary.dark} tabs={tabs} {...props} />;
};

export default AdminLayoutSelector;
