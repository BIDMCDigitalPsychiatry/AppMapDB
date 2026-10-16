import React from 'react';
import GenericContent from '../GenericContent';
import MultiSelectCheck from '../../DialogField/MultiSelectCheck';
import {
  TreatmentApproachQuestions,
  Features,
  Conditions,
  Platforms,
  Costs,
  ClinicalFoundations,
  Privacies,
  Functionalities,
  DeveloperTypes,
  Engagements,
  VisibleUses,
  Countries
} from '../../../../database/models/Application';
import { useFullScreen, useSignedIn } from '../../../../hooks';
import { Divider, Container, Typography, Box } from '@mui/material';
import { useFilters } from '../../../../database/useFilters';
import AutoCompleteSelect from '../../DialogField/AutoCompleteSelect';
import { Grid } from '@mui/material';
import { InjectField } from '../../GenericDialog/Fields';
import { useTableFilterValues } from '../../GenericTable/store';
import { useT, tx, tc } from '../../../../i18n';

export const title = tx('Apply Filters'); // also the dialog-state id: tx keeps it English
const maxWidth = 400;
const minWidth = 280;

const spacing = 6;

function Content({ fields, values, mapField, fullWidth, setValues, state, setState, ...props }) {
  const injectField = id => <InjectField id={id} fields={fields} values={values} setValues={setValues} mapField={mapField} fullWidth={fullWidth} {...props} />;
  const t = useT();
  return (
    <Grid container justifyContent='center' spacing={spacing}>
      <Grid item xs style={{ minWidth: 280, maxWidth: 400 }}>
        <Typography variant='h6'>{t(tc('apa', 'Accessibility'))}</Typography>
        <Divider style={{ marginBottom: 8 }} />
        <Grid container spacing={1}>
          {injectField('Platforms')}
          {injectField('Cost')}
          {injectField('DeveloperTypes')}
          {injectField('Conditions')}
        </Grid>
        <Box mt={spacing / 2}>
          <Typography variant='h6'>{t('Country Availability')}</Typography>
          <Divider style={{ marginBottom: 8 }} />
          <Grid container spacing={1}>
            {injectField('Countries')}
          </Grid>
        </Box>
        <Box mt={spacing / 2}>
          <Typography variant='h6'>{t('Interoperability')}</Typography>
          <Divider style={{ marginBottom: 8 }} />
          <Grid container spacing={1}>
            {injectField('Functionalities')}
            {injectField('Uses')}
          </Grid>
        </Box>
      </Grid>
      <Grid item xs style={{ minWidth: 280, maxWidth: 400 }}>
        <Typography variant='h6'>{t('Engagement Style')}</Typography>
        <Divider style={{ marginBottom: 8 }} />
        <Grid container spacing={1}>
          {injectField('Features')}
          {injectField('Engagements')}
        </Grid>
        <Box mt={spacing / 2}>
          <Typography variant='h6'>{t('Clinical Foundation')}</Typography>
          <Divider style={{ marginBottom: 8 }} />
          <Grid container spacing={1}>
            {injectField('ClinicalFoundations')}
          </Grid>
        </Box>
        <Box mt={spacing / 2}>
          <Typography variant='h6'>{t('Privacy')}</Typography>
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
  const t = useT();
  const [advanced, setAdvanced] = React.useState(false);
  // Option values stay English (they are matched and saved); only the displayed label is translated
  const toItems = (values: string[]) => values.map(value => ({ value, label: t(value) }));
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
    cancelLabel: t('Close'),
    width,
    fields: [
      {
        id: 'SavedFilter',
        label: t('Load from Saved Filters'),
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
        label: t('Platforms'),
        Field: MultiSelectCheck,
        items: toItems(Platforms),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Cost',
        label: t('Cost'),
        Field: MultiSelectCheck,
        items: toItems(Costs),
        style: { minWidth, maxWidth }
      },
      {
        id: 'DeveloperTypes',
        label: t('Developer Types'),
        Field: MultiSelectCheck,
        items: toItems(DeveloperTypes),
        style: { minWidth, maxWidth }
      },
      {
        id: 'TreatmentApproaches',
        label: t('Treatment Approaches'),
        Field: MultiSelectCheck,
        items: TreatmentApproachQuestions.map(label => ({ value: label, label })),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Features',
        label: t('Features'),
        Field: MultiSelectCheck,
        items: toItems(Features),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Functionalities',
        label: t('Functionalities'),
        Field: MultiSelectCheck,
        items: toItems(Functionalities),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Conditions',
        label: t('Supported Conditions'),
        Field: MultiSelectCheck,
        items: toItems(Conditions),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Engagements',
        label: t('Engagements'),
        Field: MultiSelectCheck,
        items: toItems(Engagements),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Privacy',
        label: t('Privacy'),
        Field: MultiSelectCheck,
        items: toItems(Privacies),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Uses',
        label: t('Uses'),
        Field: MultiSelectCheck,
        items: toItems(VisibleUses),
        style: { minWidth, maxWidth }
      },
      {
        id: 'Countries',
        label: t('Country Availability'),
        Field: MultiSelectCheck,
        items: toItems(Countries),
        style: { minWidth, maxWidth }
      },
      {
        id: 'ClinicalFoundations',
        label: t('Evidence & Clinical Foundations'),
        Field: MultiSelectCheck,
        items: toItems(ClinicalFoundations),
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
