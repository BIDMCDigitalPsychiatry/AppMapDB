import * as React from 'react';
import { Avatar, Box, Chip, Typography, useTheme } from '@mui/material';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import { useTableFilter } from '../helpers';
import { RegisteredUser } from '../../../../database/listRegisteredUsers';

/*
 * Read-only report of every registered Cognito account (self-registered app
 * raters included), opened from Admin > Users. Super Admin only — the page
 * gates the fetch and the write API enforces the role server-side. No actions
 * here by design: it's a view, not a management surface.
 */

export const name = 'RegisteredUsers';

const defaultProps: GenericTableContainerProps = {
  name,
  dialogs: [],
  toolbar: false,
  footer: true, // "Viewing N RegisteredUsers"
  search: false
};

const center = (node: React.ReactNode) => <div style={{ textAlign: 'center' }}>{node}</div>;

const EmailCell = ({ email = '', status = '', enabled = true }) => {
  const { palette } = useTheme();
  const inactive = enabled === false;
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
      {status !== 'CONFIRMED' && <Chip label='unconfirmed' size='small' sx={{ height: 20 }} />}
      {inactive && <Chip label='disabled' size='small' color='error' variant='outlined' sx={{ height: 20 }} />}
    </Box>
  );
};

const DateCell = (field: string) => (row: any) =>
  (
    <Typography variant='body2' color='textSecondary' noWrap>
      {row[field] ? new Date(row[field]).toLocaleDateString() : ''}
    </Typography>
  );

const RatingsCell = ({ ratings = undefined as number | undefined }) =>
  center(
    <Typography variant='body2' sx={{ fontWeight: ratings ? 600 : 400, color: ratings ? 'text.primary' : 'text.secondary' }}>
      {ratings ?? 0}
    </Typography>
  );

// Sort comparators follow the shared table conventions: 'textLower' for
// emails, 'decimal' for numeric values — dates are epoch milliseconds and
// rating counts are numbers, so both order numerically (never as strings);
// missing values sort as 0.
const useColumns = (statsSkipped: boolean) =>
  React.useMemo(
    () => [
      { name: 'email', header: 'Email', Cell: EmailCell, sort: 'textLower' },
      { name: 'created', header: 'Registered', width: 130, Cell: DateCell('created'), sort: 'decimal' },
      ...(statsSkipped
        ? []
        : [
            { name: 'ratings', header: 'Ratings', width: 100, Cell: RatingsCell, sort: 'decimal' },
            { name: 'firstActivity', header: 'First Rating', width: 130, Cell: DateCell('firstActivity'), sort: 'decimal' },
            { name: 'lastActivity', header: 'Last Activity', width: 130, Cell: DateCell('lastActivity'), sort: 'decimal' }
          ])
    ],
    [statsSkipped]
  );

// Report rows -> table rows (sortable primitives per column name).
const toRows = (users: RegisteredUser[]) =>
  users
    .slice()
    .sort((a, b) => (b.lastActivity ?? b.created ?? 0) - (a.lastActivity ?? a.created ?? 0))
    .map(u => ({
      _id: u.email,
      ...u,
      getSearchValues: () => `${u.email} ${u.status}`,
      getValues: () => u
    }));

export const RegisteredUsers = ({ users = [] as RegisteredUser[], statsSkipped = false, height = undefined, ...other }) => {
  const columns = useColumns(statsSkipped);
  const rows = React.useMemo(() => toRows(users), [users]);
  // Header-click sorting lives in the table store; useTableFilter is what
  // actually applies it to the rows (raw `data` bypasses it otherwise).
  const data = useTableFilter(rows, name);
  return <GenericTableContainer {...defaultProps} data={data} columns={columns} showScroll={true} height={height} {...other} />;
};
