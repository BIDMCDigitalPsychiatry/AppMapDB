import * as React from 'react';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import { useColumns } from './columns';
import { useLoadRoster, useRoster, RosterUser } from '../../../../database/useUsers';

export const name = 'Users';

const defaultProps: GenericTableContainerProps = {
  name,
  dialogs: [],
  toolbar: false,
  footer: true, // "Viewing N Users"
  search: false
};

// Roster rows -> table rows (sortable primitives per column name).
// Study accounts (only the analytics role — 101 MIND study logins) are
// hidden unless asked for, so they don't bury the staff roster.
export const isStudyOnlyAccount = (u: RosterUser) => (u.roles ?? []).length > 0 && (u.roles ?? []).every(r => r === 'analytics');

const useUsersTableData = (showStudyAccounts: boolean) => {
  useLoadRoster(true);
  const roster = useRoster();
  return React.useMemo(
    () =>
      (Object.values(roster) as RosterUser[])
        .filter(u => u && u.email && (showStudyAccounts || !isStudyOnlyAccount(u)))
        .sort((a, b) => a.email.localeCompare(b.email))
        .map(u => ({
          _id: u.email,
          email: u.email,
          roles: u.roles ?? [],
          admin: (u.roles ?? []).includes('admin'),
          superadmin: (u.roles ?? []).includes('superadmin'),
          notify: (u.roles ?? []).includes('notify'),
          surveynotify: (u.roles ?? []).includes('surveynotify'),
          submissionreviewer: (u.roles ?? []).includes('submissionreviewer'),
          analytics: (u.roles ?? []).includes('analytics'),
          active: u.active,
          status: u.active === false ? 'deactivated' : 'active',
          updated: u.updated,
          updatedBy: u.updatedBy,
          getSearchValues: () => `${u.email} ${(u.roles ?? []).join(' ')}`,
          getValues: () => u
        })),
    [roster, showStudyAccounts]
  );
};

export const Users = ({ height = undefined, showStudyAccounts = false, ...other }) => {
  const columns = useColumns();
  const data = useUsersTableData(showStudyAccounts);
  return <GenericTableContainer {...defaultProps} data={data} columns={columns} showScroll={true} height={height} {...other} />;
};
