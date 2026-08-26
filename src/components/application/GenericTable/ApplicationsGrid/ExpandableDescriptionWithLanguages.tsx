import React from 'react';
import { Tab, Tabs, Typography } from '@mui/material';
import { getAndroidIdFromUrl, getAppleIdFromUrl, isEmpty } from '../../../../helpers';
import DialogButton from '../../GenericDialog/DialogButton';
import ExpandableDescription from './ExpandableDescription';
import Axios from 'axios';
import { googlePlayProxyUrl } from '../../../../constants';

async function getAppInfo(appId, type, lang) {
  const { data } = await Axios.get(`${googlePlayProxyUrl}?appId=${appId}&type=${type}&lang=${lang}`);
  return data;
}

export const getDescription = ({ appleStore, androidStore }) => {
  var description = !isEmpty(appleStore?.description) ? appleStore.description : androidStore?.description;
  return description;
};

export default function ExpandableDescriptionWithLanguages({
  variant = 'body1' as any,
  functionalities = [],
  iosLink,
  androidLink,
  maxDescription = 1000,
  androidStore = undefined,
  appleStore = undefined,
  handleRefresh = undefined
}) {
  const isFrench = functionalities?.includes('French');
  const isSpanish = functionalities?.includes('Spanish');
  const [state, setState] = React.useState({ loading: false, appleStore: undefined, androidStore: undefined });

  const [tab, setTab] = React.useState('English');

  var languageTabs = ['English'];

  if (isFrench) {
    languageTabs = languageTabs.concat('French');
  }
  if (isSpanish) {
    languageTabs = languageTabs.concat('Spanish');
  }

  const googleAppId = !isEmpty(androidLink) ? getAndroidIdFromUrl(androidLink) : undefined;
  const appleAppId = !isEmpty(iosLink) ? getAppleIdFromUrl(iosLink) : undefined;

  const handleGetAppInfo = React.useCallback(
    language => {
      async function fetchData() {
        const lang = language === 'French' ? 'fr' : language === 'Spanish' ? 'es' : 'en';
        var iStore = undefined as any;
        var aStore = undefined as any;
        try {
          if (!isEmpty(appleAppId)) {
            iStore = await getAppInfo(appleAppId, 'apple', lang);
            //handleChange(appleStoreField)({ target: { value: appleAppInfo } });
          }
          if (!isEmpty(googleAppId)) {
            aStore = await getAppInfo(googleAppId, 'google', lang);
            //handleChange(androidStoreField)({ target: { value: appInfo } });
          }
          setState(prev => ({ ...prev, loading: false, androidStore: aStore, appleStore: iStore }));
        } catch (error) {
          setState(prev => ({ ...prev, loading: false }));
        }
      }
      if (language !== 'English') {
        setState(prev => ({ ...prev, loading: true, androidStore: undefined, appleStore: undefined }));
        fetchData();
      }
    },
    [googleAppId, appleAppId, setState]
  );

  const handleChangeTab = (event: React.ChangeEvent<{}>, newValue: any) => {
    setTab(newValue);
    handleGetAppInfo(newValue);
  };

  var langDescription = getDescription({ appleStore: state.appleStore, androidStore: state.androidStore });
  const selectedAppleStore = tab === 'English' || isEmpty(langDescription) ? appleStore : state.appleStore;
  const selectedAndroidStore = tab === 'English' || isEmpty(langDescription) ? androidStore : state.androidStore;

  return (
    <>
      {languageTabs?.length > 1 && (
        <Tabs value={tab} onChange={handleChangeTab} sx={{ mb: 2, minHeight: 40 }}>
          {languageTabs.map(p => (
            <Tab key={p} value={p} label={p} sx={{ minHeight: 40 }} />
          ))}
        </Tabs>
      )}
      {state?.loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <ExpandableDescription maxDescription={maxDescription} appleStore={selectedAppleStore} androidStore={selectedAndroidStore} />
      )}
    </>
  );
}
