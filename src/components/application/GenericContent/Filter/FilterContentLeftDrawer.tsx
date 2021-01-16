import React from 'react';
import GenericContent from '../GenericContent';
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
  Uses
} from '../../../../database/models/Application';
import { useFullScreen } from '../../../../hooks';
import { Grid } from '@material-ui/core';
import { InjectField } from '../../GenericDialog/Fields';
import { useTableFilterValues } from '../../GenericTable/store';

const sections = {
  Accessibility: {
    fields: ['Cost', 'DeveloperTypes', 'Conditions']
  },
  Interoperability: {
    fields: ['Functionalities', 'Uses']
  },
  'Engagement Style': {
    fields: ['Features', 'Engagements']
  },
  'Clinical Foundation': {
    fields: ['ClinicalFoundations']
  },
  Privacy: {
    fields: ['Privacy']
  }
};

export const title = 'Apply Filters';
const maxWidth = 400;
const minWidth = 240;

const spacing = 6;

function Content({ fields, values, mapField, fullWidth, setValues, state, setState, ...props }) {
  const injectField = id => <InjectField id={id} fields={fields} values={values} setValues={setValues} mapField={mapField} fullWidth={fullWidth} {...props} />;

  return (
    <Grid container justify='center' spacing={spacing}>
      <Grid item xs style={{ minWidth: 280, maxWidth: 400 }}>
        {Object.keys(sections).map(k => {
          const { fields } = sections[k];
          return <>{fields.map(f => injectField(f))}</>;
        })}
      </Grid>
    </Grid>
  );
}

export default function FilterContentLeftDrawer({ id = title, ...other }) {
  const [advanced, setAdvanced] = React.useState(false);
  const handleToggleAdvanced = React.useCallback(() => {
    setAdvanced(prev => !prev);
  }, [setAdvanced]);
  const fullScreen = useFullScreen();
  const width = fullScreen ? 290 : 700;

  const props = {
    id,
    advanced,
    handleToggleAdvanced,
    submitLabel: null,
    cancelLabel: 'Close',
    width,
    fields: [
      {
        id: 'Cost',
        Field: MultiSelectCheckExpandable,
        items: Costs.map(label => ({ value: label, label })),
        style: { minWidth, maxWidth }
      },
      {
        id: 'DeveloperTypes',
        label: 'Developer Types',
        Field: MultiSelectCheckExpandable,
        items: DeveloperTypes.map(label => ({ value: label, label })),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Features',
        Field: MultiSelectCheckExpandable,
        items: Features.map(label => ({ value: label, label })),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Functionalities',
        Field: MultiSelectCheckExpandable,
        items: Functionalities.map(label => ({ value: label, label })),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Conditions',
        label: 'Supported Conditions',
        Field: MultiSelectCheckExpandable,
        items: Conditions.map(label => ({ value: label, label })),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Engagements',
        Field: MultiSelectCheckExpandable,
        items: Engagements.map(label => ({ value: label, label })),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Privacy',
        Field: MultiSelectCheckExpandable,
        items: Privacies.map(label => ({ value: label, label })),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Uses',
        Field: MultiSelectCheckExpandable,
        items: Uses.map(label => ({ value: label, label })),
        style: { minWidth, maxWidth }
      },
      {
        id: 'ClinicalFoundations',
        label: 'Evidence & Clinical Foundations',
        Field: MultiSelectCheckExpandable,
        items: ClinicalFoundations.map(label => ({ value: label, label })),
        style: { minWidth, maxWidth }
      }
    ],
    ...other
  };

  const [values, setValues] = useTableFilterValues('Applications');

  return <GenericContent {...props} Content={Content} values={values} setValues={setValues} disableInitialize={true} />;
}
