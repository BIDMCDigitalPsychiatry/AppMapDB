import * as React from 'react';
import * as Icons from '@mui/icons-material';
import { Avatar, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import { useRosterActions } from './useRosterActions';

/*
 * Users roster table columns (PLAN_MODERNIZATION.md §2). Each permission
 * header carries an info tooltip describing exactly what the role grants;
 * cells act through useRosterActions, and the write API re-enforces every
 * rule server-side (Super Admin only).
 */

export const ROLE_INFO: Record<string, string> = {
  admin: 'Admins can approve, un-approve, and archive app ratings from the Pending Approvals and App History views.',
  superadmin:
    'Only Super Admins can see this Users page and assign roles. They can add, edit, deactivate, and permanently delete users — regular admins cannot.',
  notify: 'Notify recipients receive the site’s notification emails: "Flag / Suggest an Edit" submissions and "Rate An App" interest form entries.',
  surveynotify: 'Survey Notify recipients receive the notice sent each time a visitor completes an app survey.'
};

const center = (node: React.ReactNode) => <div style={{ textAlign: 'center' }}>{node}</div>;

export const RoleHeader = ({ label, info }: { label: string; info: string }) => (
  <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}>
    {label}
    <Tooltip title={info} placement='top' arrow>
      <Icons.InfoOutlined sx={{ fontSize: 16, verticalAlign: 'middle', color: 'text.secondary', cursor: 'help' }} />
    </Tooltip>
  </Box>
);

const EmailCell = ({ email = '', active = undefined }) => {
  const { palette } = useTheme();
  const { myEmail } = useRosterActions();
  const inactive = active === false;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, opacity: inactive ? 0.55 : 1 }}>
      <Avatar
        sx={{
          width: 30,
          height: 30,
          fontSize: 13,
          fontWeight: 700,
          bgcolor: inactive ? 'action.disabled' : palette.primary.dark,
          color: palette.getContrastText(inactive ? palette.action.disabled : palette.primary.dark)
        }}
      >
        {String(email).charAt(0).toUpperCase()}
      </Avatar>
      <Typography noWrap sx={{ fontWeight: 500 }}>
        {email}
      </Typography>
      {email === myEmail && <Chip label='you' size='small' color='primary' variant='outlined' sx={{ height: 20 }} />}
      {inactive && <Chip label='deactivated' size='small' sx={{ height: 20 }} />}
    </Box>
  );
};

const RoleCell = (role: string) => ({ email = '', roles = [] as string[], active = undefined }) => {
  const { roster, toggleRole } = useRosterActions();
  const user = roster[String(email).toLowerCase()];
  if (!user) return null;
  return center(<Checkbox size='small' color='primary' checked={(roles ?? []).includes(role)} disabled={active === false} onChange={() => toggleRole(user, role)} />);
};

const ActionsCell = ({ email = '', active = undefined }) => {
  const { roster, toggleActive, deleteUser } = useRosterActions();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const user = roster[String(email).toLowerCase()];
  if (!user) return null;
  const inactive = active === false;
  return center(
    <>
      <Tooltip
        title={inactive ? 'Reactivate this user — restores their access and roles' : 'Deactivate this user — removes all access but keeps their record and roles'}
        placement='top'
        arrow
      >
        <IconButton size='small' color={inactive ? 'primary' : 'default'} onClick={() => toggleActive(user)}>
          {inactive ? <Icons.HowToReg fontSize='small' /> : <Icons.PersonOffOutlined fontSize='small' />}
        </IconButton>
      </Tooltip>
      <Tooltip title='Delete this user permanently — for people who have left; cannot be undone' placement='top' arrow>
        <IconButton size='small' onClick={() => setConfirmOpen(true)}>
          <Icons.DeleteOutline fontSize='small' />
        </IconButton>
      </Tooltip>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth='xs' fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete user?</DialogTitle>
        <DialogContent>
          <Typography>
            Permanently remove <b>{email}</b> from the roster? They lose all roles immediately. This cannot be undone (they can be re-added later if needed).
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button sx={{ textTransform: 'none' }} onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant='contained'
            color='error'
            disableElevation
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            onClick={() => {
              setConfirmOpen(false);
              deleteUser(user);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const LastChangedCell = ({ updated = undefined, updatedBy = undefined }) => (
  <Typography variant='body2' color='textSecondary' noWrap>
    {updated ? new Date(updated).toLocaleDateString() : ''} {updatedBy ? `by ${updatedBy}` : ''}
  </Typography>
);

export const useColumns = () => [
  { name: 'email', header: 'Email', Cell: EmailCell },
  { name: 'superadmin', header: <RoleHeader label='Super Admin' info={ROLE_INFO.superadmin} />, width: 150, Cell: RoleCell('superadmin'), hoverable: false },
  { name: 'admin', header: <RoleHeader label='Admin' info={ROLE_INFO.admin} />, width: 110, Cell: RoleCell('admin'), hoverable: false },
  { name: 'notify', header: <RoleHeader label='Notify' info={ROLE_INFO.notify} />, width: 110, Cell: RoleCell('notify'), hoverable: false },
  { name: 'surveynotify', header: <RoleHeader label='Survey Notify' info={ROLE_INFO.surveynotify} />, width: 150, Cell: RoleCell('surveynotify'), hoverable: false },
  { name: 'updated', header: 'Last Changed', width: 240, Cell: LastChangedCell },
  { name: 'actions', header: 'Actions', width: 120, Cell: ActionsCell, hoverable: false }
];
