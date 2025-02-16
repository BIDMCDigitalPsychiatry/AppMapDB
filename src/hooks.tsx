import React from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { useSelector } from 'react-redux';
import pkg from '../package.json';
import { getCurrentDate, isDev, isEmpty, uuid } from './helpers';
import useProcessData from './database/useProcessData';
import { tables } from './database/dbConfig';
import { useTrackingId } from './components/layout/store';

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
  //const [trackingId, setTrackingId] = useTrackingId();

  const installed = useUrlParameter('installed');

  const processData = useProcessData();

  /*React.useEffect(() => {
    if (isEmpty(trackingId)) {
      const tId = uuid() as String;
      console.log(`Setting id: ${tId}`);
      setTrackingId(tId);
    }
  }, [trackingId, setTrackingId]);*/

  React.useEffect(() => {
    if (/*!isDev() &&*/ isClient && !isGoogleBot() && !isBingBot()) {
      var trackingId;
      try {
        console.log('Getting tId...');
        trackingId = localStorage.getItem('tId');
        console.log('tId = ' + trackingId);
      } catch (ex) {
        console.error('Error getting tId', ex);
      }

      if (isEmpty(trackingId)) {
        trackingId = uuid();
        try {
          console.log('Setting tId = ' + trackingId);
          localStorage.setItem('tId', trackingId);
        } catch (ex) {
          console.error('Error setting tId', ex);
        }
      }
      console.log({ trackingId });

      if (!isEmpty(trackingId)) {
        // Store tracking info
        console.log('Reading metadata...');
        processData({
          Model: tables.tracking,
          Data: { _id: trackingId },
          Action: 'r',
          onSuccess: response => {
            console.log('Received metadata', response);
            const prev = response?.Item ?? {};
            var newData = {
              _id: trackingId,
              ...prev // merge any existing data prior to udpating
            };

            if (isPwa) {
              if (installed) {
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
                onSuccess: response => {
                  console.log('Successfully updated metadata', { response, Data: newData });
                },
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
    } else {
      console.log('Skipping track logic!');
    }
  }, [installed]);
};
