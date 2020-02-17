import * as React from 'react';
import { Button, Typography, Grid, Box } from '@material-ui/core';
import { googlePlayProxyUrl } from '../../constants';
import axios from 'axios';
import Text from '../application/DialogField/Text';

async function getAppInfo(appId) {
  const { data } = await axios.get(`${googlePlayProxyUrl}?appId=${appId}`);
  return data;
}

export default function PlayGround() {
  const [appInfo, setAppInfo] = React.useState({});
  const [appId, setAppId] = React.useState('com.google.android.apps.translate');

  React.useEffect(() => {
    handleGetAppInfo();
  }, []);

  const handleGetAppInfo = React.useCallback(() => {
    async function fetchData() {
      try {
        const appInfo = await getAppInfo(appId);
        setAppInfo(appInfo);
      } catch (error) {
        setAppInfo({ Error: error });
      }
    }
    fetchData();
  }, [appId, setAppInfo]);

  return (
    <div>
      <Grid container spacing={2} alignItems='center'>
        <Grid item>
          <Text style={{ width: 400 }} value={appId} onChange={event => setAppId(event.target.value)} label='Enter Google Play App Id' />
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
