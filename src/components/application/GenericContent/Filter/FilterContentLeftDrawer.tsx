import React from 'react';
import MultiSelectCheckExpandable from '../../DialogField/MultiSelectCheckExpandable';
import {
  TreatmentApproaches,
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
  Platforms,
  Inputs,
  Outputs
} from '../../../../database/models/Application';
import { Grid } from '@mui/material';
import { useTableFilterValue } from '../../GenericTable/store';
import { categories } from '../../../../constants';
import { useFullScreen } from '../../../../hooks';
import { isEmpty, sortAscending, sortAscendingLabel } from '../../../../helpers';
import { useSelector } from 'react-redux';

export const title = 'Apply Filters';

const getFilters = version =>
  [
    {
      id: 'Platforms',
      items: Platforms.map(label => ({ value: label, label }))
    },
    {
      id: 'Cost',
      items: Costs.map(label => ({ value: label, label })).filter(({ value }) =>
        version === 'full' ? true : ['Free to Download', 'Totally Free', 'Subscription'].includes(value)
      )
    },
    version === 'full' && {
      id: 'DeveloperTypes',
      label: 'Developer Types',
      items: DeveloperTypes.map(label => ({ value: label, label }))
    },
    {
      id: 'Conditions',
      label: 'Supported Conditions',
      items: Conditions.map(label => ({ value: label, label })).filter(({ value }) =>
        version === 'full'
          ? true
          : ['Sleep', 'Perinatal Depression', 'Stress & Anxiety', 'Schizophrenia', 'Bipolar Disorder', 'PTSD', 'OCD', 'Substance Use'].includes(value)
      )
    },
    version === 'full' && {
      id: 'Functionalities',
      items: Functionalities.map(label => ({ value: label, label }))
    },
    version === 'full' && {
      id: 'Uses',
      items: Uses.map(label => ({ value: label, label: withReplacement(label) }))
    },
    {
      id: 'TreatmentApproaches',
      label: 'Treatment Approaches',
      items: TreatmentApproaches.map(label => ({ value: label, label: withReplacement(label) }))
    },
    {
      id: 'Features',
      items: Features.map(label => ({ value: label, label: withReplacement(label) })).filter(({ value }) =>
        version === 'full'
          ? true
          : ['Journaling', 'Mindfulness', 'Track Mood', 'Track Symptoms', 'Track Medication', 'Track Sleep', 'CBT', 'DBT'].includes(value)
      )
    },
    version === 'full' && {
      id: 'Engagements',
      items: Engagements.map(label => ({ value: label, label }))
    },
    version === 'full' && {
      id: 'ClinicalFoundations',
      label: 'Evidence & Clinical Foundations',
      items: ClinicalFoundations.filter(label => label !== 'Can Cause Harm').map(label => ({ value: label, label: withReplacement(label) })) // Exclude Can Cause Harm per request
    },
    version === 'full' && {
      id: 'Inputs',
      items: Inputs.map(label => ({ value: label, label }))
    },
    version === 'full' && {
      id: 'Outputs',
      items: Outputs.map(label => ({ value: label, label }))
    },
    {
      id: 'Privacy',
      items: Privacies.map(label => ({ value: label, label: withReplacement(label) })).filter(({ value }) =>
        version === 'full' ? true : ['Can Opt Out of Data Collection', 'Can Delete Data', 'Data Stored on Device'].includes(value)
      )
    }
  ]
    .filter(v => !isEmpty(v))
    .map(i => ({ ...i, color: categories[i.id]?.color, items: i.items?.sort(sortAscendingLabel) }))
    .sort((a, b) => sortAscending(!isEmpty(a.label) ? a.label : a.id, !isEmpty(b.label) ? b.label : b.id));

const ConnectedMultiSelect = ({ id, label, color, items }) => {
  const [value, setValue] = useTableFilterValue('Applications', id);
  return <MultiSelectCheckExpandable value={value} label={label ?? id} color={color} items={items} onChange={setValue} />;
};

export default function FilterContentLeftDrawer() {
  const fullScreen = useFullScreen();
  const version = useSelector((s: any) => s.layout.version);
  return (
    <Grid container>
      {getFilters(version)
        .filter(f => (f.id === 'Platforms' ? fullScreen : true))
        .map(({ id, label, color, items }) => (
          <Grid item key={id} xs={12}>
            <ConnectedMultiSelect id={id} label={label} color={color} items={items} />
          </Grid>
        ))}
    </Grid>
  );
}
