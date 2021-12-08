import React from 'react';
import { Typography, Tabs, makeStyles, Tab } from '@material-ui/core';
import google_play_store from '../../../../../images/google_play_store.png';
import apple_store from '../../../../../images/apple_store.png';
import web from '../../../../../images/web.png';
import TabLabel from './TabLabel';
import NewWindowLink from '../../../DialogField/NewWindowLink';
import { getAndroidIdFromUrl, getAppleIdFromUrl, isEmpty } from '../../../../../helpers';
import { googlePlayProxyUrl } from '../../../../../constants';
import Axios from 'axios';
import AppleStore from '../../../DialogField/AppleStore';
import AndroidStore from '../../../DialogField/AndroidStore';

async function getAppInfo(appId, type) {
  const { data } = await Axios.get(`${googlePlayProxyUrl}?appId=${appId}&type=${type}`);
  return data;
}

const useStyles = makeStyles((theme: any) => ({
  root: {
    flexGrow: 1
  },
  padding: {
    padding: theme.spacing(2)
  },
  tabs: {
    backgroundColor: 'inherit'
  },
  tab: {
    textTransform: 'none',
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.pxToRem(15),
    marginRight: theme.spacing(1),
    '&:focus': {
      opacity: 1
    }
  },
  indicator: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    '& > div': {
      width: '100%',
      backgroundColor: theme.palette.primary.light
    }
  }
}));

const labelMap = {
  iOS: 'Apple Store',
  Android: 'Google Play Store',
  Web: 'Web'
};

const iconMap = {
  iOS: apple_store,
  Android: google_play_store,
  Web: web
};

export const ApplicationTabsView = ({ platforms = [], androidLink, iosLink, webLink }) => {
  const classes = useStyles();

  const googleAppId = getAndroidIdFromUrl(androidLink);
  const appleAppId = getAppleIdFromUrl(iosLink);

  const [{ loading, tab, androidStore, appleStore }, setState] = React.useState({
    loading: false,
    tab: 0,
    androidStore: { value: '', load: true },
    appleStore: { value: '', load: true }
  });

  const handleGetAppInfo = React.useCallback(() => {
    async function fetchData() {
      try {
        var androidAppInfo = '';
        var appleAppInfo = '';
        if (androidStore.load === true && !isEmpty(googleAppId)) {
          androidAppInfo = await getAppInfo(googleAppId, 'google');
        }
        if (appleStore.load === true && !isEmpty(appleAppId)) {
          appleAppInfo = await getAppInfo(appleAppId, 'apple');
        }
        setState(prev => ({
          ...prev,
          loading: false,
          androidStore: { ...prev.androidStore, value: isEmpty(androidAppInfo) ? prev.androidStore.value : androidAppInfo, load: false },
          appleStore: { ...prev.appleStore, value: isEmpty(appleAppInfo) ? prev.appleStore.value : appleAppInfo, load: false }
        }));
      } catch (error) {
        setState(prev => ({ ...prev, loading: false }));
      }
    }
    setState(prev => ({ ...prev, loading: true }));
    fetchData();
  }, [googleAppId, appleAppId, setState, androidStore.load, appleStore.load]);

  React.useEffect(() => {
    (!isEmpty(googleAppId) || !isEmpty(appleAppId)) && handleGetAppInfo();
  }, [handleGetAppInfo, googleAppId, appleAppId]);

  const handleChangeTab = (event: React.ChangeEvent<{}>, newValue: number) => {
    setState(prev => ({ ...prev, tab: newValue }));
  };

  return (
    <div className={classes.root}>
      <div className={classes.tabs}>
        <Tabs
          classes={{ indicator: classes.indicator }}
          value={tab}
          onChange={handleChangeTab}
          aria-label='styled tabs example'
          TabIndicatorProps={{ children: <div /> }}
        >
          {platforms.map(p => (
            <Tab key={p} className={classes.tab} label={<TabLabel label={labelMap[p]} icon={iconMap[p]} />} disableRipple />
          ))}
        </Tabs>
        <Typography className={classes.padding} />
      </div>
      {platforms.map(
        (p, i) =>
          tab === i &&
          !loading && (
            <div key={p}>
              {p === 'Web' ? (
                <NewWindowLink url={webLink} label={'Open Web Link'} />
              ) : p === 'Android' ? (
                <AndroidStore value={androidStore.value as any} />
              ) : (
                <AppleStore value={appleStore.value as any} />
              )}
            </div>
          )
      )}
    </div>
  );
};
