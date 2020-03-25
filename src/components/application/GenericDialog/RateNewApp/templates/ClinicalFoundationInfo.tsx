import React from 'react';
import { Grid, Typography, Theme, Tabs, makeStyles, Tab, Box, Collapse } from '@material-ui/core';
import { InjectField } from '../../Fields';
import { getAndroidIdFromUrl, isEmpty, getAppleIdFromUrl } from '../../../../../helpers';
import axios from 'axios';
import { googlePlayProxyUrl } from '../../../../../constants';
import { useHandleChange } from '../../helpers';
import google_play_store from '../../../../../images/google_play_store.png';
import apple_store from '../../../../../images/apple_store.png';
import web from '../../../../../images/web.png';
import TabLabel from './TabLabel';
import OutlinedDiv from '../../../../general/OutlinedDiv/OutlinedDiv';
import LightTooltip from '../../../../general/LightTooltip/LightTooltip';
import * as Icons from '@material-ui/icons';

async function getAppInfo(appId, type) {
  const { data } = await axios.get(`${googlePlayProxyUrl}?appId=${appId}&type=${type}`);
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

export default function ClinicalFoundationInfo({ fields, values, mapField, fullWidth, setValues, state, setState, ...props }) {
  const handleChange = useHandleChange(setValues);
  const androidStoreField = fields.find(f => f.id === 'androidStore');
  const appleStoreField = fields.find(f => f.id === 'appleStore');

  const injectField = id => <InjectField id={id} fields={fields} values={values} mapField={mapField} fullWidth={fullWidth} {...props} />;

  const googleAppId = getAndroidIdFromUrl(values.applications.androidLink);
  const appleAppId = getAppleIdFromUrl(values.applications.iosLink);

  const handleGetAppInfo = React.useCallback(() => {
    async function fetchData() {
      try {
        if (!isEmpty(googleAppId)) {
          const appInfo = await getAppInfo(googleAppId, 'google');
          handleChange(androidStoreField)({ target: { value: appInfo } });
        }
        if (!isEmpty(appleAppId)) {
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

  const classes = useStyles();
  const [tab, setTab] = React.useState(0);

  const handleChangeTab = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };

  const clinicalFoundations = values.applications.clinicalFoundations || [];

  return (
    <Grid container justify='center' spacing={3}>
      <Grid item xs style={{ maxWidth: 700 }}>
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
          {values.applications.platforms.map((p, i) => tab === i && !loading && <div key={p}>{injectField(keyMap[p])}</div>)}
        </div>
      </Grid>
      <Grid item xs style={{ minWidth: 280, maxWidth: 600 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {injectField('clinicalFoundations')}
          </Grid>
          <Grid item xs={12}>
            <Collapse in={clinicalFoundations.includes('Supporting Studies')}>
              <OutlinedDiv label='Supporting Studies'>
                {[
                  { id: 'feasibilityStudies', label: 'How many feasibility/usability studies?' },
                  {
                    id: 'feasibilityImpact',
                    label: 'What is the highest feasibility impact factor?',
                    tooltip: `What is the impact factor of the journal in which the feasibility study is published? This can easily be found with a quick google search. If it's not immediately evident, put "0" and assume the journal doesn't have an impact factor.`
                  },
                  { id: 'efficacyStudies', label: 'How many evidence/efficacy studies?' },
                  {
                    id: 'efficacyImpact',
                    label: 'What is the highest efficacy impact factor?',
                    tooltip: `What is the impact factor of the journal in which the efficacy study is published? This can easily be found with a quick google search. If it's not immediately evident, put "0" and assume the journal doesn't have an impact factor.`
                  }
                ].map(({ label, id, tooltip }) => (
                  <Grid key={id} container alignItems='center' justify='space-between' spacing={2}>
                    <Grid item>
                      <Typography>{label}</Typography>
                    </Grid>
                    <Grid item>
                      <Grid container justify='flex-end' alignItems='center' spacing={1}>
                        {tooltip && (
                          <Grid item>
                            <LightTooltip title={tooltip}>
                              <Icons.HelpOutlined fontSize='small' color='primary' />
                            </LightTooltip>
                          </Grid>
                        )}
                        <Grid item style={{ width: 94 }}>
                          {injectField(id)}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                ))}
              </OutlinedDiv>
            </Collapse>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
