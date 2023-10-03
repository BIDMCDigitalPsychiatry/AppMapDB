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
  Uses
} from '../../../../database/models/Application';
import { useFullScreen } from '../../../../hooks';
import TableSearch from '../../GenericTable/TableSearch';

export const title = 'Apply Filters';

export default function FilterPopover({ id = title, ...other }) {
  const fullScreen = useFullScreen();
  const width = fullScreen ? 290 : 700;
  return (
    <GenericPopover
      id={id}
      submitLabel={null}
      cancelLabel='Close'
      width={width}
      columns={2}
      minColumnWidth={275}
      maxColumnWidth={350}
      disableInitialize={true}
      fields={[
        { id: 'TextSearch', label: 'Text Search', Field: TableSearch },
        {
          id: 'Platforms',
          Field: MultiSelectCheck,
          items: Platforms.map(label => ({ value: label, label }))
        },
        {
          id: 'Cost',
          Field: MultiSelectCheck,
          items: Costs.map(label => ({ value: label, label }))
        },
        {
          id: 'DeveloperTypes',
          label: 'Developer Types',
          Field: MultiSelectCheck,
          items: DeveloperTypes.map(label => ({ value: label, label }))
        },
        {
          id: 'Functionalities',
          Field: MultiSelectCheck,
          items: Functionalities.map(label => ({ value: label, label }))
        },
        {
          id: 'TreatmentApproaches',
          label: 'Treatment Approaches',
          Field: MultiSelectCheck,
          items: TreatmentApproaches.map(label => ({ value: label, label }))
        },
        {
          id: 'Features',
          Field: MultiSelectCheck,
          items: Features.map(label => ({ value: label, label }))
        },
        {
          id: 'Conditions',
          label: 'Supported Conditions',
          Field: MultiSelectCheck,
          items: Conditions.map(label => ({ value: label, label }))
        },
        {
          id: 'Engagements',
          Field: MultiSelectCheck,
          items: Engagements.map(label => ({ value: label, label }))
        },
        /*{
          id: 'Inputs',
          Field: MultiSelectCheck,
          items: Inputs.map(label => ({ value: label, label }))
        },
        {
          id: 'Outputs',
          Field: MultiSelectCheck,
          items: Outputs.map(label => ({ value: label, label }))
        },*/
        {
          id: 'Privacy',
          Field: MultiSelectCheck,
          items: Privacies.map(label => ({ value: label, label }))
        },
        {
          id: 'Uses',
          Field: MultiSelectCheck,
          items: Uses.map(label => ({ value: label, label }))
        },
        {
          id: 'ClinicalFoundations',
          label: 'Evidence & Clinical Foundations',
          Field: MultiSelectCheck,
          items: ClinicalFoundations.map(label => ({ value: label, label }))
        }
      ]}
      {...other}
    />
  );
}
