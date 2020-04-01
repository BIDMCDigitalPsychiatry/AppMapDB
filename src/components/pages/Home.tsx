import * as React from 'react';
import { Grid, Typography, Box } from '@material-ui/core';
import FilterContent from '../application/GenericContent/Filter';
import { useTableFilterValues } from '../application/GenericTable/store';
import { useFullScreen } from '../../hooks';
import { useWidth } from '../layout/store';
import useFilterList from '../../database/useFilterList';

const contentWidth = 600;
const spacing = 2;

export default function Home() {
  const [values, setValues] = useTableFilterValues('Applications');

  useFilterList();
  const fullScreen = useFullScreen();
  const xs = fullScreen ? 12 : 6;
  const width = useWidth();

  const maxWidth = width - contentWidth - spacing * 8 > 1000 ? 808 : 400;

  return (
    <Box m={2}>
      <Grid container spacing={spacing} justify='space-around'>
        {/*<Grid item xs={xs} style={{ minWidth: 300, maxWidth: contentWidth }}>
          <Framework />
        </Grid>
        */}
        <Grid item xs={xs} style={{ minWidth: 300, maxWidth, marginTop: 12 }}>
          <Typography variant='h6' color='textPrimary' style={{ marginTop: 8, marginBottom: 8 }}>
            Select filters and click search:
          </Typography>
          <FilterContent values={values} setValues={setValues} />
        </Grid>
      </Grid>
    </Box>
  );
}
