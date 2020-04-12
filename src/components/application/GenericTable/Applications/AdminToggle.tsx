import React from 'react';
import * as Icons from '@material-ui/icons';
import { useAdminMode } from '../../../layout/store';
import { useIsAdmin } from '../../../../hooks';
import { makeStyles, createStyles, Fab, Tooltip } from '@material-ui/core';

const useStyles = makeStyles(({ spacing }: any) =>
  createStyles({
    fab: {
      position: 'absolute',
      bottom: spacing(25),
      right: spacing(3),
      zIndex: 999999
    }
  })
);

export default function AdminToggle() {
  const classes = useStyles();
  const isAdmin = useIsAdmin();
  const [adminMode, setAdminMode] = useAdminMode() as any;
  const handleClick = React.useCallback(() => setAdminMode(adminMode === true ? false : true), [adminMode, setAdminMode]);
  const Icon = adminMode === true ? Icons.PermIdentity : Icons.PeopleAlt;
  const tooltip = `Switch to ${adminMode === true ? 'Public Mode' : 'Admin Mode'}`;
  return isAdmin ? (
    <Tooltip title={tooltip} placement='left'>
      <Fab className={classes.fab} size='large' color='primary' aria-label='admin-public-mode' onClick={handleClick}>
        <Icon />
      </Fab>
    </Tooltip>
  ) : (
    <></>
  );
}
