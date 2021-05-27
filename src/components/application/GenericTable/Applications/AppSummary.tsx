import React from 'react';
import { List, ListItem, ListItemAvatar, ListItemText } from '@material-ui/core';
import { getAppName, getAppCompany, getAppIcon } from './selectors';
import Application from '../../../../database/models/Application';

export default function AppSummary(app: Application) {
  const { icon = getAppIcon(app) } = app;
  const company = getAppCompany(app);
  return (
    <List disablePadding={true} dense={true}>
      <ListItem dense={true} disableGutters={true} divider={false}>
        <ListItemAvatar style={{ minWidth: 48 }}>{<img style={{ height: 40 }} src={icon} alt='logo' />}</ListItemAvatar>
        <ListItemText primary={getAppName(app)} secondary={company && ` by ${company}`} />
      </ListItem>
    </List>
  );
}
