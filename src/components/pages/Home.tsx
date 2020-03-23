import * as React from 'react';
import { Grid, Typography, Box, Button } from '@material-ui/core';
import { useHandleChangeRoute } from '../layout/hooks';
import { publicUrl } from '../../helpers';
import FilterContent from '../application/GenericContent/Filter';
import { useTableFilterValues } from '../application/GenericTable/store';
import Framework from '../pages/Framework';
import { useFullScreen } from '../../hooks';
import { useWidth } from '../layout/store';

const contentWidth = 600;
const spacing = 2;

export default function Home() {
  const handleChangeRoute = useHandleChangeRoute();
  const [values, setValues] = useTableFilterValues('Applications');
  const [advanced, setAdvanced] = React.useState(false);
  const handleToggleAdvanced = React.useCallback(() => {
    setAdvanced(prev => !prev);
  }, [setAdvanced]);

  const fullScreen = useFullScreen();
  const xs = fullScreen ? 12 : 6;
  const width = useWidth();

  console.log({ one: width - contentWidth - spacing * 8 });

  const maxWidth = width - contentWidth - spacing * 8 > 1000 ? 808 : 400;

  return (
    <Box m={2}>
      <Grid container spacing={spacing} justify='space-around'>
        <Grid item xs={xs} style={{ minWidth: 300, maxWidth: contentWidth }}>
          <Framework />
        </Grid>
        <Grid item xs={xs} style={{ minWidth: 350, maxWidth, marginTop: 12 }}>
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
