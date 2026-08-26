import * as React from 'react';
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, TextField, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { Users } from '../../application/GenericTable/Users/table';
import { ROLE_INFO } from '../../application/GenericTable/Users/columns';
import { useRosterActions } from '../../application/GenericTable/Users/useRosterActions';
import { WRITE_API_URL } from '../../../database/useProcessData';
import { validateEmail } from '../../../helpers';
import { useHeaderHeightSetRef } from '../../layout/hooks';

/*
 * Admin > Users (Super Admin only — gated in Admin.tsx/AdminLayoutSelector,
 * enforced server-side by the write API): banner header in the same style as
 * the other admin tabs, with the roster in the shared GenericTable (full
 * width/height, sortable columns, "Viewing N Users" footer).
 */

const ROLE_LABELS: Record<string, string> = { admin: 'Admin', superadmin: 'Super Admin', notify: 'Notify' };

const useStyles = makeStyles(({ breakpoints, palette }: any) =>
  createStyles({
    header: {
      background: palette.primary.light,
      padding: 32,
      [breakpoints.down('sm')]: { padding: 16 }
    },
    primaryText: {
      fontSize: 30,
      fontWeight: 900,
      color: palette.primary.dark
    },
    primaryButton: {
      borderRadius: 7,
      color: palette.common.white,
      background: palette.primary.dark,
      minWidth: 160,
      height: 40,
      fontWeight: 600,
      textTransform: 'none' as const,
      '&:hover': {
        background: palette.primary.main
      }
    }
  })
);

export default function UsersAdmin({ height = undefined as number | undefined }) {
  const classes = useStyles();
  const { roster, addUser, fail } = useRosterActions();

  const [addOpen, setAddOpen] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState('');
  const [newRoles, setNewRoles] = React.useState<string[]>([]);

  const handleAdd = () => {
    const email = newEmail.trim().toLowerCase();
    if (!validateEmail(email)) return fail('Enter a valid email address');
    if (roster[email]) return fail('That email is already on the roster');
    addUser(email, newRoles);
    setAddOpen(false);
    setNewEmail('');
    setNewRoles([]);
  };

  return (
    <>
      <Grid ref={useHeaderHeightSetRef()} container className={classes.header} alignItems='center' justifyContent='space-between'>
        <Grid item>
          <Typography className={classes.primaryText}>Users &amp; Roles</Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Visible to Super Admins only. Changes take effect immediately and are recorded with who made them
            {!WRITE_API_URL && ' (write API not configured — changes will not be permitted)'}.
          </Typography>
        </Grid>
        <Grid item>
          <Button className={classes.primaryButton} onClick={() => setAddOpen(true)}>
            Add User
          </Button>
        </Grid>
      </Grid>

      <Users height={height} />

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth='xs' fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add User</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label='Email address' value={newEmail} onChange={e => setNewEmail(e.target.value)} sx={{ mt: 1 }} />
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column' }}>
            {Object.keys(ROLE_LABELS).map(key => (
              <FormControlLabel
                key={key}
                control={<Checkbox checked={newRoles.includes(key)} onChange={() => setNewRoles(prev => (prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]))} />}
                label={
                  <span>
                    <b>{ROLE_LABELS[key]}</b>
                    <Typography component='span' variant='body2' color='textSecondary'>
                      {' '}
                      — {ROLE_INFO[key]}
                    </Typography>
                  </span>
                }
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button sx={{ textTransform: 'none' }} onClick={() => setAddOpen(false)}>
            Cancel
          </Button>
          <Button variant='contained' disableElevation sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }} onClick={handleAdd}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
