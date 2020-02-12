import React from 'react';
import logo from '../../../../images/logo.png';
import { List, ListItem, ListItemAvatar, ListItemText } from '@material-ui/core';

export default function AppSummary({ name, company, icon = logo }) {
  return (
    <List disablePadding={true} dense={true}>
      <ListItem dense={true} disableGutters={true} divider={false}>
        <ListItemAvatar style={{ minWidth: 48 }}>{<img style={{ height: 40 }} src={icon} alt='logo' />}</ListItemAvatar>
        <ListItemText primary={name} secondary={company && ` by ${company}`} />
      </ListItem>
    </List>
  );
}
