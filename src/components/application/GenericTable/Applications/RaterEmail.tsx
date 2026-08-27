import React from 'react';
import { Typography } from '@mui/material';
import { isEmpty } from '../../../../helpers';
import { useIsSuperAdmin } from '../../../../hooks';

// Rater identity is only exposed to super admins; everyone else sees the
// generic label so public/rater views stay anonymous.
export const useRaterLabel = (email?: string) => {
  const isSuperAdmin = useIsSuperAdmin();
  return isSuperAdmin && !isEmpty(email) ? email : 'App Rater';
};

// Caption line showing the rater's email (e.g. under an evaluation date).
// Renders nothing unless the viewer is a super admin.
export const RaterEmail = ({ email = undefined as string | undefined }) => {
  const isSuperAdmin = useIsSuperAdmin();
  if (!isSuperAdmin || isEmpty(email)) return null;
  return (
    <Typography variant='caption' color='textSecondary' noWrap display='block'>
      {email}
    </Typography>
  );
};
