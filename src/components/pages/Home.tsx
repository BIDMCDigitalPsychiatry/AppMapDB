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

export const variableFilters = [
  {
    key: 'Cost',
    availableFilters: ['Totally Free'],
    stepKey: 'Free'
  },
  {
    key: 'Privacy',
    availableFilters: ['Has Privacy Policy', 'App Declares Data Use and Purpose'],
    stepKey: 'YesNoPrivacy'
  },
  {
    key: 'Functionalities',
    availableFilters: ['Email or Export Your Data'],
    stepKey: 'YesNoFunctionality'
  }
];

export default function Home() {
  const [values, setValues] = useTableFilterValues('Applications');

  useFilterList();
  const fullScreen = useFullScreen();
  const xs = fullScreen ? 12 : 6;
  const width = useWidth();

  const handleTabChange = React.useCallback(
    (tab) => {
      if (tab === 0) {
        // If we navigate to the 0 tab, adjust the filter values since the filters cannot show all of the filters from the other step.  The other step can show all of the filters from the first step so no need to reset in that case.
        setValues((prev) => {
          const ids = steps
            .map((s) => s.fields)
            .reduce((t: any, c) => (t = t.concat(c)), [])
            .map((s) => s.id);

          const copy = { ...prev };

          const matchingKeys = Object.keys(copy).filter((key) => ids.find((id) => id === key));

          matchingKeys.forEach((mk) => {
            const vfi = variableFilters.findIndex((vf) => vf.key === mk);
            const vf = variableFilters[vfi];
            if (copy[mk] && vfi > -1 && vf !== undefined && Array.isArray(copy[mk])) {
              var allFound = vf.availableFilters.reduce((t, c) => (t = t === true && copy[mk].findIndex((id) => id === c) > -1), true);
              if (allFound) {
                copy[vf.stepKey] = [true];
              } else {
                copy[vf.stepKey] = [false];
              }
              copy[vf.key] = copy[vf.key].filter((k) => vf.availableFilters.findIndex((af) => af === k) > -1); // Remove any filters values that aren't supported by the interactive search
            }
          });

          if (copy['Features']) {
            copy['Features'] = copy['Features'].filter((f) => FeatureImages.find((fi) => fi.value === f)); // Ensure we only keep the filters that apply
          }

          if (copy['Platforms']) {
            copy['Platforms'] = copy['Platforms'].filter((p) => PlatformImages.find((pi) => pi.value === p)); // Ensure we only keep the filters that apply
          }

          return copy;
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