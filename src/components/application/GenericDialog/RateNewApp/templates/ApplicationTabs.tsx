import React from 'react';
import { Typography, Theme, Tabs, makeStyles, Tab } from '@material-ui/core';
import google_play_store from '../../../../../images/google_play_store.png';
import apple_store from '../../../../../images/apple_store.png';
import web from '../../../../../images/web.png';
import TabLabel from './TabLabel';
import NewWindowLink from '../../../DialogField/NewWindowLink';
import { getAndroidIdFromUrl, getAppleIdFromUrl, isEmpty } from '../../../../../helpers';
import { useHandleChange } from '../../helpers';
import { googlePlayProxyUrl } from '../../../../../constants';
import Axios from 'axios';

async function getAppInfo(appId, type) {
  const { data } = await Axios.get(`${googlePlayProxyUrl}?appId=${appId}&type=${type}`);
  return data;
}

const useStyles = makeStyles((theme: Theme) => ({
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

const keyMap = {
  iOS: 'appleStore',
  Android: 'androidStore',
  Web: 'webStore'
};

export const ApplicationTabs = ({ state, values, injectField, fields, setValues, setState }) => {
  const classes = useStyles();

  const handleChange = useHandleChange(setValues);
  const androidStoreField = fields.find(f => f.id === 'androidStore');
  const appleStoreField = fields.find(f => f.id === 'appleStore');

  const googleAppId = getAndroidIdFromUrl(values.applications.androidLink);
  const appleAppId = getAppleIdFromUrl(values.applications.iosLink);

  const handleGetAppInfo = React.useCallback(() => {
    async function fetchData() {
      try {
        if (androidStoreField.load === true && !isEmpty(googleAppId)) {
          const appInfo = await getAppInfo(googleAppId, 'google');
          handleChange(androidStoreField)({ target: { value: appInfo } });
        }
        if (appleStoreField.load === true && !isEmpty(appleAppId)) {
          const appleAppInfo = await getAppInfo(appleAppId, 'apple');
          handleChange(appleStoreField)({ target: { value: appleAppInfo } });
        }
        setState(prev => ({ ...prev, loading: false }));
      } catch (error) {
        setState(prev => ({ ...prev, loading: false }));
      }
    }
    setState(prev => ({ ...prev, loading: true }));
    fetchData();
  }, [googleAppId, appleAppId, setState, handleChange, androidStoreField, appleStoreField]);

  React.useEffect(() => {
    (!isEmpty(googleAppId) || !isEmpty(appleAppId)) && handleGetAppInfo();
  }, [handleGetAppInfo, googleAppId, appleAppId]);

  const { loading } = state;

  const [tab, setTab] = React.useState(0);

  const handleChangeTab = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
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
          {values.applications.platforms.map(p => (
            <Tab key={p} className={classes.tab} label={<TabLabel label={labelMap[p]} icon={iconMap[p]} />} disableRipple />
          ))}
        </Tabs>
        <Typography className={classes.padding} />
      </div>
      {values.applications.platforms.map(
        (p, i) =>
          tab === i &&
          !loading && <div key={p}>{p === 'Web' ? <NewWindowLink url={values.applications.webLink} label={'Open Web Link'} /> : injectField(keyMap[p])}</div>
      )}
    </div>
  );
};
