import * as React from 'react';
import { Grid, Typography, Box, Button, Link } from '@material-ui/core';
import ReactPlayer from 'react-player';
import { useHandleChangeRoute } from '../layout/hooks';
import { publicUrl } from '../../helpers';
import FilterContent from '../application/GenericContent/Filter';
import { useTableFilterValues } from '../application/GenericTable/store';

export default function Home() {
  const handleChangeRoute = useHandleChangeRoute();
  const [values, setValues] = useTableFilterValues('Applications');
  const [advanced, setAdvanced] = React.useState(false);
  const handleToggleAdvanced = React.useCallback(() => {
    setAdvanced(prev => !prev);
  }, [setAdvanced]);

  return (
    <Box m={2}>
      <Grid container spacing={4} justify='space-around'>
        <Grid item style={{ minWidth: 300, maxWidth: 500 }}>
          <Grid container spacing={1} justify='center'>
            <Grid item xs={12}>
              <Typography variant='h4'>Welcome!</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='h6' style={{ marginTop: 8 }}>
                If you need help getting started, please take a minute to review the video below:
              </Typography>
            </Grid>
            <Grid item style={{ width: 600 }}>
              <ReactPlayer width='100%' url='https://www.youtube.com/watch?v=nLF0n9SACd4' controls />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6} style={{ minWidth: 350, maxWidth: 1200, marginTop: 48 }}>
          <Typography variant='h6' color='textPrimary' style={{ marginTop: 8, marginBottom: 8 }}>
            Select filters and click search:
          </Typography>
          <FilterContent values={values} setValues={setValues} advanced={advanced} />-
          <Button style={{ marginLeft: 8, marginRight: 8 }} variant='text' size='small' onClick={handleToggleAdvanced}>
            {`${advanced ? 'Hide' : 'Show'} Advanced Filters`}
          </Button>
          -
          <Button size='small' style={{ marginLeft: 16 }} variant='contained' color='primary' onClick={handleChangeRoute(publicUrl('/Apps'))}>
            Search
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
