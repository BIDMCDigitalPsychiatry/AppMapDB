import React from 'react';
import { Tab, Tabs, Typography } from '@mui/material';
import { getAndroidIdFromUrl, getAppleIdFromUrl, isEmpty } from '../../../../helpers';
import DialogButton from '../../GenericDialog/DialogButton';
import ExpandableDescription from './ExpandableDescription';
import Axios from 'axios';
import { googlePlayProxyUrl } from '../../../../constants';
import { useT, tx, useCurrentLanguage } from '../../../../i18n';

// Description tabs (values stay English) → store listing language
const STORE_LANG: Record<string, string> = { French: 'fr', Spanish: 'es', German: 'de' };
const UI_LANGUAGE_TABS: Record<string, string | undefined> = { en: undefined, fr: 'French', de: 'German' };

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
  const t = useT();
  const uiLang = useCurrentLanguage();
  // The store's own description in the visitor's interface language (French/German) is offered — and opened by
  // default — even when the app isn't tagged as supporting that language; stores fall back to English otherwise.
  const uiTab = UI_LANGUAGE_TABS[uiLang];
  const isFrench = functionalities?.includes('French') || uiTab === 'French';
  const isSpanish = functionalities?.includes('Spanish');
  const isGerman = uiTab === 'German';
  const [state, setState] = React.useState({ loading: false, appleStore: undefined, androidStore: undefined });

  const [tab, setTab] = React.useState('English');

  // Tab values stay English (compared below); only the label is translated.
  var languageTabs: string[] = [tx('English')];

  if (isFrench) {
    languageTabs = languageTabs.concat(tx('French'));
  }
  if (isSpanish) {
    languageTabs = languageTabs.concat(tx('Spanish'));
  }
  if (isGerman) {
    languageTabs = languageTabs.concat(tx('German'));
  }

  const googleAppId = !isEmpty(androidLink) ? getAndroidIdFromUrl(androidLink) : undefined;
  const appleAppId = !isEmpty(iosLink) ? getAppleIdFromUrl(iosLink) : undefined;

  const handleGetAppInfo = React.useCallback(
    language => {
      async function fetchData() {
        const lang = STORE_LANG[language] ?? 'en';
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

  // Open the interface language's tab automatically (and switch back to English when the visitor does).
  React.useEffect(() => {
    const next = uiTab ?? 'English';
    setTab(next);
    handleGetAppInfo(next);
  }, [uiTab, handleGetAppInfo]);

  var langDescription = getDescription({ appleStore: state.appleStore, androidStore: state.androidStore });
  const selectedAppleStore = tab === 'English' || isEmpty(langDescription) ? appleStore : state.appleStore;
  const selectedAndroidStore = tab === 'English' || isEmpty(langDescription) ? androidStore : state.androidStore;
  // The store returned its English listing (or nothing) for the chosen language.
  const noTranslation = tab !== 'English' && !state.loading && (isEmpty(langDescription) || langDescription === getDescription({ appleStore, androidStore }));

  return (
    <>
      {languageTabs?.length > 1 && (
        <Tabs value={tab} onChange={handleChangeTab} sx={{ mb: 2, minHeight: 40 }}>
          {languageTabs.map(p => (
            <Tab key={p} value={p} label={t(p)} sx={{ minHeight: 40 }} />
          ))}
        </Tabs>
      )}
      {state?.loading ? (
        <Typography>{t('Loading...')}</Typography>
      ) : (
        <>
          {noTranslation && (
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1, fontStyle: 'italic' }}>
              {t('The app store has no description in this language, so the English description is shown.')}
            </Typography>
          )}
          <ExpandableDescription maxDescription={maxDescription} appleStore={selectedAppleStore} androidStore={selectedAndroidStore} />
        </>
      )}
    </>
  );
}
