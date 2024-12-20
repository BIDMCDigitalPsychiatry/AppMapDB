import React from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { useSelector } from 'react-redux';
import pkg from '../package.json';

export const useFullScreen = (size = 'sm' as any) => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down(size));
};

export const useSignedIn = () => {
  return useSelector((s: any) => s.layout.user !== undefined);
};

export const useSignedInPro = () => {
  return useSelector((s: any) => {
    const { user } = s.layout;
    if (user !== undefined && user !== '' && user !== null) {
      const { attributes = {} } = user;
      if (attributes['custom:userType']?.toLowerCase() === 'pro') {
        return true;
      }
    }
    return false;
  });
};

export const useSignedInRater = () => {
  const signedIn = useSignedIn();
  const signedInPro = useSignedInPro();
  return signedIn && !signedInPro;
};

export const useIsAdmin = () => {
  const signedIn = useSignedIn();
  const email = useSelector((s: any) => s.layout.user?.signInUserSession?.idToken?.payload?.email ?? '');
  const adminEmails = pkg?.adminUsers?.split(',');
  return signedIn && adminEmails.findIndex(ae => ae.trim().toLowerCase() === email.trim().toLowerCase()) > -1 ? true : false;
};

export const useIsTestUser = () => {
  const signedIn = useSignedIn();
  const email = useSelector((s: any) => s.layout.user?.signInUserSession?.idToken?.payload?.email ?? '');
  const testEmails = pkg?.testUsers?.split(',');
  return signedIn && testEmails.findIndex(ae => ae.trim().toLowerCase() === email.trim().toLowerCase()) > -1 ? true : false;
};

export const useHandleLink = link => {
  return React.useCallback(() => {
    const win = window.open(link, '_blank');
    win && win.focus();
  }, [link]);
};

export const useUrlParameter = paramName => {
  var sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === paramName) {
      return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
    }
  }
  return undefined;
};
