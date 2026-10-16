import React from 'react';
import { List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { getAppName, getAppCompany, getAppIcon } from './selectors';
import Application from '../../../../database/models/Application';
import { useT } from '../../../../i18n';

export default function AppSummary(app: Application) {
  const { icon = getAppIcon(app) } = app;
  const company = getAppCompany(app);
  const t = useT();
  return (
    <List disablePadding={true} dense={true}>
      <ListItem dense={true} disableGutters={true} divider={false}>
        <ListItemAvatar style={{ minWidth: 48 }}>{<img style={{ height: 40 }} src={icon} alt={t('logo')} />}</ListItemAvatar>
        <ListItemText primary={getAppName(app)} secondary={company && ` ${t('by {{name}}', { name: company })}`} />
      </ListItem>
    </List>
  );
}
