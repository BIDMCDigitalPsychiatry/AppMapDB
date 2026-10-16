import React from 'react';
import GenericPopover from '../GenericPopover';
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
import { useFullScreen } from '../../../../hooks';
import TableSearch from '../../GenericTable/TableSearch';
import { useT, tx } from '../../../../i18n';

export const title = tx('Apply Filters'); // also the dialog-state id: tx keeps it English

export default function FilterPopover({ id = title, ...other }) {
  const t = useT();
  // Option values stay English (they are matched and saved); only the displayed label is translated
  const toItems = (values: string[]) => values.map(value => ({ value, label: t(value) }));
  const fullScreen = useFullScreen();
  const width = fullScreen ? 290 : 700;
  return (
    <GenericPopover
      id={id}
      submitLabel={null}
      cancelLabel={t('Close')}
      width={width}
      columns={2}
      minColumnWidth={275}
      maxColumnWidth={350}
      disableInitialize={true}
      fields={[
        { id: 'TextSearch', label: t('Text Search'), Field: TableSearch },
        {
          id: 'Platforms',
          label: t('Platforms'),
          Field: MultiSelectCheck,
          items: toItems(Platforms)
        },
        {
          id: 'Cost',
          label: t('Cost'),
          Field: MultiSelectCheck,
          items: toItems(Costs)
        },
        {
          id: 'DeveloperTypes',
          label: t('Developer Types'),
          Field: MultiSelectCheck,
          items: toItems(DeveloperTypes)
        },
        {
          id: 'Functionalities',
          label: t('Functionalities'),
          Field: MultiSelectCheck,
          items: toItems(Functionalities)
        },
        {
          id: 'TreatmentApproaches',
          label: t('Treatment Approaches'),
          Field: MultiSelectCheck,
          items: toItems(TreatmentApproaches)
        },
        {
          id: 'Features',
          label: t('Features'),
          Field: MultiSelectCheck,
          items: toItems(Features)
        },
        {
          id: 'Conditions',
          label: t('Supported Conditions'),
          Field: MultiSelectCheck,
          items: toItems(Conditions)
        },
        {
          id: 'Engagements',
          label: t('Engagements'),
          Field: MultiSelectCheck,
          items: toItems(Engagements)
        },
        /*{
          id: 'Inputs',
          Field: MultiSelectCheck,
          items: toItems(Inputs)
        },
        {
          id: 'Outputs',
          Field: MultiSelectCheck,
          items: toItems(Outputs)
        },*/
        {
          id: 'Privacy',
          label: t('Privacy'),
          Field: MultiSelectCheck,
          items: toItems(Privacies)
        },
        {
          id: 'Uses',
          label: t('Uses'),
          Field: MultiSelectCheck,
          items: toItems(VisibleUses)
        },
        {
          id: 'Countries',
          label: t('Country Availability'),
          Field: MultiSelectCheck,
          items: toItems(Countries)
        },
        {
          id: 'ClinicalFoundations',
          label: t('Evidence & Clinical Foundations'),
          Field: MultiSelectCheck,
          items: toItems(ClinicalFoundations)
        }
      ]}
      {...other}
    />
  );
}
