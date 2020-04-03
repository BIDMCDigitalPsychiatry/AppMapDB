import * as React from 'react';
import { Grid, Typography, useTheme } from '@material-ui/core';
import FilterContent from '../application/GenericContent/Filter';
import { useTableFilterValues } from '../application/GenericTable/store';
import { useFullScreen } from '../../hooks';
import { useWidth, useHeight, useAppBarHeight } from '../layout/store';
import useFilterList from '../../database/useFilterList';
import * as Icons from '@material-ui/icons';
import NavPills from '../general/NavPills/NavPills';
import InteractiveSearchCard from '../application/GenericDialog/InteractiveSearch/InteractiveSearchCard';
import steps from '../application/GenericDialog/InteractiveSearch/steps';
import { FeatureImages, PlatformImages } from '../../database/models/Application';

const spacing = 2;

export default function Home() {
  const [values, setValues] = useTableFilterValues('Applications');

  useFilterList();
  const fullScreen = useFullScreen();
  const xs = fullScreen ? 12 : 6;
  const width = useWidth();

  const handleTabChange = React.useCallback(
    tab => {
      if (tab === 0) {
        // If we navigate to the 0 tab, adjust the filter values since the filters cannot show all of the filters from the other step.  The other step can show all of the filters from the first step so no need to reset in that case.
        setValues(prev => {
          const ids = steps
            .map(s => s.fields)
            .reduce((t: any, c) => (t = t.concat(c)), [])
            .map(s => s.id);

          const copy = { ...prev };

          const matchingKeys = Object.keys(copy).filter(key => ids.find(id => id === key));
          const filteredValues = matchingKeys.reduce((t, c) => (t = { ...t, [c]: copy[c] }), {});

          if (filteredValues['Cost']) {
            filteredValues['Cost'] = filteredValues['Cost'].filter(id => id === 'Totally Free'); // Ensure totally free is the only option that is kept, other values should be disregarded
            if (filteredValues['Cost'].find(id => id === 'Totally Free')) {
              filteredValues['Free'] = [true];
            } else {
              filteredValues['Free'] = [false];
            }
          }

          if (filteredValues['Features']) {
            filteredValues['Features'] = filteredValues['Features'].filter(f => FeatureImages.find(fi => fi.value === f)); // Ensure we only keep the filters that apply
          }

          if (filteredValues['Platforms']) {
            filteredValues['Platforms'] = filteredValues['Platforms'].filter(p => PlatformImages.find(pi => pi.value === p)); // Ensure we only keep the filters that apply
          }

          return filteredValues;
        });
      }
    },
    [setValues]
  );

  const height = useHeight();
  const appBarHeight = useAppBarHeight();
  const { layout } = useTheme();

  var contentHeight =
    height -
    [
      appBarHeight,
      layout.contentpadding, // Top content padding
      layout.tabheight, // Nav pills tab section height
      layout.contentpadding, // Bottom content padding
      layout.footerheight
    ].reduce((t, c) => t + c, 0);

  var contentWidth = width - layout.contentpadding * 2;
  const maxWidth = width - contentWidth - spacing * 8 > 1000 ? 808 : 400;

  return (
    <NavPills
      contentHeight={contentHeight}
      color='primary'
      alignCenter
      active={0}
      onChange={handleTabChange}
      tabs={[
        {
          tabIcon: Icons.ImageSearch,
          tabButton: 'Interactive Search',
          tabContent: <InteractiveSearchCard values={values} setValues={setValues} />
        },
        {
          tabIcon: Icons.Search,
          tabButton: 'Search by Filters',
          tabContent: (
            <Grid container spacing={spacing} justify='space-around'>
              <Grid item xs={xs} style={{ minWidth: 300, maxWidth, marginTop: 12 }}>
                <Typography variant='h6' color='textPrimary' style={{ marginTop: 8, marginBottom: 8 }}>
                  Select filters and click search:
                </Typography>
                <FilterContent values={values} setValues={setValues} />
              </Grid>
            </Grid>
          )
        }
      ]}
    />
  );
}
