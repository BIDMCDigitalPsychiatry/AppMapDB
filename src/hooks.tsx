import React from 'react';
import { useTheme, useMediaQuery } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { adminUsers } from '../package.json';

export const useFullScreen = (size = 'sm' as any) => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down(size));
};

export const useSignedIn = () => {
  const isEmpty = useSelector((s: any) => s.layout.user === undefined);
  const isLoaded = useSelector((s: any) => s.layout.user !== undefined);
  return isLoaded && !isEmpty ? true : false;
};

export const useIsAdmin = () => {
  const signedIn = useSignedIn();
  const email = useSelector((s: any) => s.layout.user?.signInUserSession?.idToken?.payload?.email ?? '');
  const adminEmails = adminUsers.split(',');
  return signedIn && adminEmails.findIndex(ae => ae.trim().toLowerCase() === email.trim().toLowerCase()) > -1 ? true : false;
};

export const useHandleLink = link => {
  return React.useCallback(() => {
    const win = window.open(link, '_blank');
    win && win.focus();
  }, [link]);
};
