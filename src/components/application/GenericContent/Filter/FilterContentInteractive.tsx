import React from 'react';
import GenericContent from '../GenericContent';
import MultiSelectCheck from '../../DialogField/MultiSelectCheck';
import {
  Features,
  Conditions,
  Platforms,
  Costs,
  ClinicalFoundations,
  Privacies,
  Functionalities,
  DeveloperTypes,
  Engagements,
  Uses
} from '../../../../database/models/Application';
import { useFullScreen, useSignedIn } from '../../../../hooks';
import { Divider, Container, Typography, Box } from '@material-ui/core';
import { useFilters } from '../../../../database/useFilters';
import AutoCompleteSelect from '../../DialogField/AutoCompleteSelect';
import { Grid } from '@material-ui/core';
import { InjectField } from '../../GenericDialog/Fields';
import { useTableFilterValues } from '../../GenericTable/store';

export const title = 'Apply Filters';
const maxWidth = 400;
const minWidth = 280;

const spacing = 6;

function Content({ fields, values, mapField, fullWidth, setValues, state, setState, ...props }) {
  const injectField = id => <InjectField id={id} fields={fields} values={values} setValues={setValues} mapField={mapField} fullWidth={fullWidth} {...props} />;
  return (
    <Grid container justify='center' spacing={spacing}>
      <Grid item xs style={{ minWidth: 280, maxWidth: 400 }}>
        <Typography variant='h6'>Accessibility</Typography>
        <Divider style={{ marginBottom: 8 }} />
        <Grid container spacing={1}>
          {injectField('Platforms')}
          {injectField('Cost')}
          {injectField('DeveloperTypes')}
          {injectField('Conditions')}
        </Grid>
        <Box mt={spacing/2}>
          <Typography variant='h6'>Interoperability</Typography>
          <Divider style={{ marginBottom: 8 }} />
          <Grid container spacing={1}>
            {injectField('Functionalities')}
            {injectField('Uses')}
          </Grid>
        </Box>
      </Grid>
      <Grid item xs style={{ minWidth: 280, maxWidth: 400 }}>
        <Typography variant='h6'>Engagement Style</Typography>
        <Divider style={{ marginBottom: 8 }} />
        <Grid container spacing={1}>
          {injectField('Features')}
          {injectField('Engagements')}
        </Grid>
        <Box mt={spacing/2}>
          <Typography variant='h6'>Clinical Foundation</Typography>
          <Divider style={{ marginBottom: 8 }} />
          <Grid container spacing={1}>
            {injectField('ClinicalFoundations')}
          </Grid>
        </Box>
        <Box mt={spacing/2}>
          <Typography variant='h6'>Privacy</Typography>
          <Divider style={{ marginBottom: 8 }} />
          <Grid container spacing={1}>
            {injectField('Privacy')}
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
}

export default function FilterContentInteractive({ id = title, ...other }) {
  const [advanced, setAdvanced] = React.useState(false);
  const handleToggleAdvanced = React.useCallback(() => {
    setAdvanced(prev => !prev);
  }, [setAdvanced]);
  const fullScreen = useFullScreen();
  const width = fullScreen ? 290 : 700;
  const signedIn = useSignedIn();
  const [filters] = useFilters();

  const items = Object.keys(filters).map(k => ({ label: filters[k].name, value: filters[k] }));

  const props = {
    id,
    advanced,
    handleToggleAdvanced,
    submitLabel: null,
    cancelLabel: 'Close',
    width,
    fields: [
      {
        id: 'SavedFilter',
        label: 'Load from Saved Filters',
        Field: AutoCompleteSelect,
        items,
        style: { minWidth, maxWidth },
        hidden: !signedIn
      },
      {
        id: 'SavedFilterPlaceholder',
        Field: Divider,
        xs: 12,
        hidden: !signedIn
      },
      {
        id: 'Platforms',
        Field: MultiSelectCheck,
        items: Platforms.map(label => ({ value: label, label })),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Cost',
        Field: MultiSelectCheck,
        items: Costs.map(label => ({ value: label, label })),
        style: { minWidth, maxWidth }
      },
      {
        id: 'DeveloperTypes',
        label: 'Developer Types',
        Field: MultiSelectCheck,
        items: DeveloperTypes.map(label => ({ value: label, label })),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Features',
        Field: MultiSelectCheck,
        items: Features.map(label => ({ value: label, label })),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Functionalities',
        Field: MultiSelectCheck,
        items: Functionalities.map(label => ({ value: label, label })),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Conditions',
        label: 'Supported Conditions',
        Field: MultiSelectCheck,
        items: Conditions.map(label => ({ value: label, label })),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Engagements',
        Field: MultiSelectCheck,
        items: Engagements.map(label => ({ value: label, label })),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Privacy',
        Field: MultiSelectCheck,
        items: Privacies.map(label => ({ value: label, label })),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Uses',
        Field: MultiSelectCheck,
        items: Uses.map(label => ({ value: label, label })),
        style: { minWidth, maxWidth }
      },
      {
        id: 'ClinicalFoundations',
        label: 'Evidence & Clinical Foundations',
        Field: MultiSelectCheck,
        items: ClinicalFoundations.map(label => ({ value: label, label })),
        style: { minWidth, maxWidth }
      }
    ],
    ...other
  };

  const [values, setValues] = useTableFilterValues('Applications');

  
  return (
    <Container>
      <GenericContent {...props} Content={Content} values={values} setValues={setValues} disableInitialize={true} />
    </Container>
  );
}
