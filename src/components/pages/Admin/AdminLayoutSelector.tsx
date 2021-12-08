import { useTheme } from '@material-ui/core';
import * as React from 'react';
import TabSelectorTextToolBar from '../../general/TabSelector/TabSelectorTextToolBar';

const tabs = [
  { id: 'Pending Approvals', route: '/Admin', routeState: { subRoute: 'pending' } },
  { id: 'Surveys', route: '/Admin', routeState: { subRoute: 'surveys' } }
].filter(t => t);

const AdminLayoutSelector = ({ subRoute, ...other }) => {
  const { palette } = useTheme();
  return <TabSelectorTextToolBar id='AdminLayoutSelector' labelColor={palette.primary.dark} tabs={tabs} {...other} />;
};

export default AdminLayoutSelector;
