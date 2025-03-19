import * as React from 'react';
import { Button, Typography, Grid, Box } from '@mui/material';
import { googlePlayProxyUrl } from '../../constants';
import axios from 'axios';
import Text from '../application/DialogField/Text';
import AutoCompleteSelect from '../application/DialogField/AutoCompleteSelect';

async function getAppInfo(appId, type) {
  const { data } = await axios.get(`${googlePlayProxyUrl}?appId=${appId}&type=${type}`);
  return data;
}

export default function PlayGround() {
  const [appInfo, setAppInfo] = React.useState({});
  const [appId, setAppId] = React.useState('com.google.android.apps.translate');
  const [type, setType] = React.useState('google');

  const handleGetAppInfo = React.useCallback(() => {
    async function fetchData() {
      try {
        const appInfo = await getAppInfo(appId, type);
        setAppInfo(appInfo);
      } catch (error) {
        setAppInfo({ Error: error });
      }
    }
    fetchData();
  }, [appId, type, setAppInfo]);

  React.useEffect(() => {
    axios.get('https://itunes.apple.com/lookup?id=363590051').then(results => {
      //console.log({ results });
    });
    handleGetAppInfo();
  }, [handleGetAppInfo]);

  return (
    <div>
      <Grid container spacing={2} alignItems='center'>
        <Grid item>
          <Text style={{ width: 400 }} value={appId} onChange={event => setAppId(event.target.value)} label='Enter Google Play App Id' />
        </Grid>
        <Grid item>
          <AutoCompleteSelect
            label='Select Store Type'
            style={{ width: 200 }}
            onChange={event => setType(event.target.value)}
            value={type}
            items={[
              { label: 'Apple', value: 'apple' },
              { label: 'Google Play', value: 'google' }
            ]}
          />
        </Grid>
        <Grid item>
          <Button variant='contained' color='primary' onClick={handleGetAppInfo}>
            Get Data
          </Button>
        </Grid>
      </Grid>
      <Box mt={2}>
        <Typography variant='h5'>Results: </Typography>
        <Box m={3}>
          {JSON.stringify(appInfo)}
          {JSON.stringify(appInfo)}
        </Box>
      </Box>
    </div>
  );
}
