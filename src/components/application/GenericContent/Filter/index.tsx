import React from 'react';
import GenericContent from '../GenericContent';
import MultiSelectCheck from '../../DialogField/MultiSelectCheck';
import {
  TreatmentApproaches,
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
import { useProcessData } from '../../../../database/useProcessData';
import { useFullScreen, useSignedIn } from '../../../../hooks';
import { useHandleChangeRoute } from '../../../layout/hooks';
import { Grid, Button, Divider, Typography, Box } from '@mui/material';
import { publicUrl } from '../../../../helpers';
import { tables } from '../../../../database/dbConfig';
import { useSelector } from 'react-redux';
import { useFilters } from '../../../../database/useFilters';
import AutoCompleteSelect from '../../DialogField/AutoCompleteSelect';
import { useGetFilters } from '../../../../database/useFilterList';
import { InjectField } from '../../GenericDialog/Fields';
import { useTableFilterValues } from '../../GenericTable/store';
import TableSearch from '../../GenericTable/TableSearch';
import { useT, tx } from '../../../../i18n';

export const title = tx('Apply Filters'); // also the dialog-state id: tx keeps it English
const maxWidth = 400;
const minWidth = 280;

const spacing = 6;

function Content({ fields, values, mapField, fullWidth, setValues, state, setState, ...props }) {
  const injectField = id => <InjectField id={id} fields={fields} values={values} setValues={setValues} mapField={mapField} fullWidth={fullWidth} {...props} />;
  const { advanced } = values;
  const t = useT();
  return (
    <Grid container style={{ maxWidth: 1000 }} justifyContent='center' spacing={spacing}>
      <Grid item xs style={{ minWidth: 280, maxWidth: 400 }}>
        <Typography variant='h6'>{t('Text Search')}</Typography>
        <Divider style={{ marginBottom: 8 }} />
        <Grid container spacing={1}>
          {injectField('TextSearch')}
        </Grid>
        <Box mt={spacing / 2}>
          <Typography variant='h6'>{t('Engagement Style')}</Typography>
          <Divider style={{ marginBottom: 8 }} />
          <Grid container spacing={1}>
            {injectField('Features')}
            {injectField('Engagements')}
          </Grid>
        </Box>
        {advanced && (
          <>
            <Box mt={spacing / 2}>
              <Typography variant='h6'>{t('Interoperability')}</Typography>
              <Divider style={{ marginBottom: 8 }} />
              <Grid container spacing={1}>
                {injectField('Functionalities')}
                {injectField('Uses')}
              </Grid>
            </Box>
          </>
        )}
      </Grid>
      <Grid item xs style={{ minWidth: 280, maxWidth: 400 }}>
        <Typography variant='h6'>{t('Accessibility')}</Typography>
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
        {advanced && (
          <>
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
          </>
        )}
      </Grid>
    </Grid>
  );
}

const FilterButtons = props => {
  const t = useT();
  const handleChangeRoute = useHandleChangeRoute();
  const signedIn = useSignedIn();
  const { values, setValues, handleReset, advanced, handleToggleAdvanced } = props;
  const processData = useProcessData();
  const uid = useSelector((s: any) => s.layout.user?.username);
  const { SavedFilter } = values;
  const SavedFilterStr = JSON.stringify(SavedFilter);

  const filterName = SavedFilter ? SavedFilter.name : '';

  const getFilters = useGetFilters();

  React.useEffect(() => {
    SavedFilterStr && setValues(prev => ({ ...JSON.parse(SavedFilterStr), SavedFilter: prev.SavedFilter })); // If we changed the selected saved filter then update the filters on the page
  }, [SavedFilterStr, setValues]);

  const handleSave = React.useCallback(() => {
    var name = prompt(t('Enter a name to save current filters under.'), filterName);
    if (name) {
      var Data = { ...values, uid, name, time: new Date().getTime() };
      if (name !== filterName) {
        // If we are creating a new filter, then remove the id and rev so we don't update the old one
        const { _id, _rev, ...other } = Data;
        Data = other;
      }
      processData({ Model: tables.filters, Data });
    }
  }, [t, uid, filterName, processData, values]);

  const handleDelete = React.useCallback(() => {
    var name = prompt(t('Enter name of filter to delete.'), filterName);
    if (name) {
      processData({ Action: 'd', Model: tables.filters, Data: { ...values, uid, name, time: new Date().getTime() }, onSuccess: getFilters });
    }
  }, [t, getFilters, filterName, uid, processData, values]);

  return (
    <Grid container spacing={2} justifyContent='flex-end' alignItems='center'>
      <Grid item>
        <Button variant='outlined' size='small' onClick={handleReset}>
          {t('Reset')}
        </Button>
      </Grid>
      <Grid item>
        <Button variant='outlined' size='small' onClick={handleToggleAdvanced}>
          {advanced ? t('Hide Advanced Filters') : t('Show Advanced Filters')}
        </Button>
      </Grid>
      {signedIn && (
        <>
          <Grid item>
            <Button size='small' variant='outlined' onClick={handleSave}>
              {t('Save Filter')}
            </Button>
          </Grid>
          <Grid item>
            <Button size='small' variant='outlined' onClick={handleDelete}>
              {t('Delete Filter')}
            </Button>
          </Grid>
        </>
      )}
      <Grid item>
        <Button size='small' variant='contained' color='primary' onClick={handleChangeRoute(publicUrl('/Apps'))}>
          {t('Search')}
        </Button>
      </Grid>
    </Grid>
  );
};

export default function FilterContent({ id = title, ...other }) {
  const t = useT();
  const [values, setValues] = useTableFilterValues('Applications');
  const { advanced } = values;
  // Option values stay English (they are matched and saved); only the displayed label is translated
  const toItems = (values: string[]) => values.map(value => ({ value, label: t(value) }));

  const handleToggleAdvanced = React.useCallback(() => {
    setValues(prev => ({ ...prev, advanced: !prev.advanced }));
  }, [setValues]);

  const fullScreen = useFullScreen();
  const width = fullScreen ? 290 : 700;
  const signedIn = useSignedIn();
  const [filters] = useFilters();

  const items = Object.keys(filters).map(k => ({ label: filters[k].name, value: filters[k] }));

  const props = {
    id,
    Buttons: FilterButtons,
    advanced,
    handleToggleAdvanced,
    submitLabel: null,
    cancelLabel: t('Close'),
    width,
    fields: [
      { id: 'advanced', initialValue: false, hidden: true },
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
      { id: 'TextSearch', label: t('Text Search'), Field: TableSearch },
      {
        id: 'Platforms',
        label: t('Platforms'), // previously fell back to the id; same English text
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
        items: toItems(TreatmentApproaches),
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

  return <GenericContent {...props} Content={Content} values={values} setValues={setValues} disableInitialize={true} />;
}
