import React from 'react';
import MultiSelectCheckExpandable from '../../DialogField/MultiSelectCheckExpandable';
import {
  Features,
  Conditions,
  Costs,
  ClinicalFoundations,
  Privacies,
  Functionalities,
  DeveloperTypes,
  Engagements,
  Uses,
  withReplacement,
  Platforms
} from '../../../../database/models/Application';
import { Grid } from '@mui/material';
import { useTableFilterValue } from '../../GenericTable/store';
import { categories } from '../../../../constants';
import { useFullScreen } from '../../../../hooks';

export const title = 'Apply Filters';

const filters = [
  {
    id: 'Platforms',
    items: Platforms.map(label => ({ value: label, label }))
  },
  {
    id: 'Cost',
    items: Costs.map(label => ({ value: label, label }))
  },
  {
    id: 'DeveloperTypes',
    label: 'Developer Types',
    items: DeveloperTypes.map(label => ({ value: label, label }))
  },
  {
    id: 'Conditions',
    label: 'Supported Conditions',
    items: Conditions.map(label => ({ value: label, label }))
  },
  {
    id: 'Functionalities',
    items: Functionalities.map(label => ({ value: label, label }))
  },
  {
    id: 'Uses',
    items: Uses.map(label => ({ value: label, label }))
  },
  {
    id: 'Features',
    items: Features.map(label => ({ value: label, label: withReplacement(label) }))
  },

  {
    id: 'Engagements',
    items: Engagements.map(label => ({ value: label, label }))
  },
  {
    id: 'ClinicalFoundations',
    label: 'Evidence & Clinical Foundations',
    items: ClinicalFoundations.map(label => ({ value: label, label }))
  },
  {
    id: 'Privacy',
    items: Privacies.map(label => ({ value: label, label }))
  }
].map(i => ({ ...i, color: categories[i.id]?.color }));

const ConnectedMultiSelect = ({ id, label, color, items }) => {
  const [value, setValue] = useTableFilterValue('Applications', id);
  return <MultiSelectCheckExpandable value={value} label={label ?? id} color={color} items={items} onChange={setValue} />;
};

export default function FilterContentLeftDrawer() {
  const fullScreen = useFullScreen();
  return (
    <Grid container>
      {filters
        .filter(f => (f.id === 'Platforms' ? fullScreen : true))
        .map(({ id, label, color, items }) => (
          <Grid item key={id} xs={12}>
            <ConnectedMultiSelect id={id} label={label} color={color} items={items} />
          </Grid>
        ))}
    </Grid>
  );
}
