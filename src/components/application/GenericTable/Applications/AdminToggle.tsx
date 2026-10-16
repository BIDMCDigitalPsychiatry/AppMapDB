import React from 'react';
import * as Icons from '@mui/icons-material';
import { useAdminMode } from '../../../layout/store';
import { useIsAdmin } from '../../../../hooks';
import { Fab, Tooltip } from '@mui/material';
import { useT } from '../../../../i18n';

import { makeStyles } from '../../../../styles/jss';
import { createStyles } from '../../../../styles/jss';
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
  const t = useT();
  const isAdmin = useIsAdmin();
  const [adminMode, setAdminMode] = useAdminMode() as any;
  const handleClick = React.useCallback(() => setAdminMode(adminMode === true ? false : true), [adminMode, setAdminMode]);
  const Icon = adminMode === true ? Icons.PermIdentity : Icons.PeopleAlt;
  const tooltip = adminMode === true ? t('Switch to Public Mode') : t('Switch to Admin Mode');
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
