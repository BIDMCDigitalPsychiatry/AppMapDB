import React from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { useSelector } from 'react-redux';
import { getCurrentDate, isDev, isEmpty } from './helpers';
import useProcessData from './database/useProcessData';
import { tables } from './database/dbConfig';
import { useLoadRoster, useRosterRole } from './database/useUsers';
import getBrowserFingerprint from 'get-browser-fingerprint';

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

// Role checks: the users table is the single source of truth (the legacy
// package.json lists were retired 2026-08-26 — PLAN_MODERNIZATION.md §2).
// These are UI hints only — the write API re-verifies roles server-side on
// every privileged request.
export const useIsAdmin = () => {
  const signedIn = useSignedIn();
  const email = useSelector((s: any) => s.layout.user?.signInUserSession?.idToken?.payload?.email ?? '');
  useLoadRoster(signedIn);
  const fromRoster = useRosterRole(email, 'admin');
  return signedIn && fromRoster === true;
};

// (useIsTestUser and the testUsers list were removed 2026-08-25 — nothing had
// called them for years; the roster's role mechanism covers future needs.)

// Super Admins may view/manage the Users roster page. Roster-only (no
// package.json fallback — the role exists only in the users table); the
// write API re-verifies server-side, so this is a UI hint like the others.
export const useIsSuperAdmin = () => {
  const signedIn = useSignedIn();
  const email = useSelector((s: any) => s.layout.user?.signInUserSession?.idToken?.payload?.email ?? '');
  useLoadRoster(signedIn);
  const fromRoster = useRosterRole(email, 'superadmin');
  return signedIn && fromRoster === true;
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

export const isClient = typeof window !== 'undefined';

export const isGoogleBot = () => {
  var isGoogleBot = false;
  if (!isDev() && isClient) {
    try {
      if (window?.navigator?.userAgent?.toLowerCase().includes('storebot-google')) {
        isGoogleBot = true;
      }
    } catch {}
  }
  return isGoogleBot;
};

export const isBingBot = () => {
  var isGoogleBot = false;
  if (!isDev() && isClient) {
    try {
      if (window?.navigator?.userAgent?.toLowerCase().includes('bingbot')) {
        isGoogleBot = true;
      }
    } catch {}
  }
  return isGoogleBot;
};

export const trackingColumns = [
  '_id',
  'firstAccessDate',
  'firstAccessTimestamp',
  'lastActiveDate',
  'lastActiveTimestamp',
  'environment',
  'pathname',
  'host',
  'userAgent',
  'firstAccessDatePwa',
  'firstAccessTimestampPwa',
  'lastActiveDatePwa',
  'lastActiveTimestampPwa',
  'environmentPwa',
  'pathnamePwa',
  'hostPwa',
  'userAgentPwa'
].map(name => ({ name }));

export const useTracking = ({ isPwa = false }) => {
  const installed = useUrlParameter('installed');
  const processData = useProcessData();

  React.useEffect(() => {
    const runTracking = async () => {
      const fingerPrint = await getBrowserFingerprint();
      const trackingId = String(fingerPrint);

      if (!isEmpty(trackingId)) {
        // Store tracking info
        processData({
          Model: tables.tracking,
          Data: { _id: trackingId },
          Action: 'r',
          onSuccess: response => {
            const prev = response?.Item ?? {};
            var newData = {
              _id: trackingId,
              ...prev // merge any existing data prior to udpating
            };

            if (isPwa) {
              if (installed === '1') {
                newData.pathnamePwa = window?.location?.pathname;
                newData.lastActiveDatePwa = getCurrentDate();
                newData.lastActiveTimestampPwa = Date.now();
                newData.environmentPwa = process.env.NODE_ENV;
                newData.hostPwa = window?.location?.host;
                newData.pathnamePwa = window?.location?.pathname;
                newData.userAgentPwa = window?.navigator?.userAgent;
                if (isEmpty(prev?.firstAccessDatePwa)) {
                  newData.firstAccessDatePwa = getCurrentDate(); // If previously not accessed, mark first access date
                  newData.firstAccessTimestampPwa = Date.now();
                }
              } else {
                newData.pathname = window?.location?.pathname;
                newData.lastActiveDate = getCurrentDate();
                newData.lastActiveTimestamp = Date.now();
                newData.environment = process.env.NODE_ENV;
                newData.host = window?.location?.host;
                newData.pathname = window?.location?.pathname;
                newData.userAgent = window?.navigator?.userAgent;
                if (isEmpty(prev?.firstAccessDate)) {
                  newData.firstAccessDate = getCurrentDate(); // If previously not accessed, mark first access date
                  newData.firstAccessTimestamp = Date.now();
                }
              }

              processData({
                Model: tables.tracking,
                Data: newData,
                Action: 'c',
                onError: response => {
                  console.error('Error updating metadata', { response, Data: newData });
                }
              });
            } else {
              //Reserved for tracking regular website usage (future, non pwa)
            }
          },
          onError: response => {
            console.error('Error', response);
          }
        });
      }
    };

    if (/*!isDev() &&*/ isClient && !isGoogleBot() && !isBingBot()) {
      runTracking();
    }
  }, [installed]);
};
