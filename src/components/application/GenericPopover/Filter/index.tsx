import React from 'react';
import GenericPopover from '../GenericPopover';
import MultiSelectCheck from '../../DialogField/MultiSelectCheck';
import {
  Features,
  Conditions,
  Platforms,
  Costs,
  ClinicalFoundations,
  Privacies,
  Functionalities,
  DeveloperTypes
} from '../../../../database/models/Application';
import AutoCompleteSelect from '../../DialogField/AutoCompleteSelect';

export const title = 'Apply Filters';

export default function FilterPopover({ id = title, ...other }) {
  return (
    <GenericPopover
      id={id}
      submitLabel={null}
      cancelLabel='Close'
      fields={[
        {
          id: 'Platforms',
          Field: MultiSelectCheck,
          items: Platforms.map(label => ({ value: label, label }))
        },
        {
          id: 'Functionalities',
          Field: MultiSelectCheck,
          items: Functionalities.map(label => ({ value: label, label }))
        },
        {
          id: 'Cost',
          Field: MultiSelectCheck,
          items: Costs.map(label => ({ value: label, label }))
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
          id: 'Privacy',
          Field: MultiSelectCheck,
          items: Privacies.map(label => ({ value: label, label }))
        },
        {
          id: 'Clinical Foundation',
          Field: AutoCompleteSelect,
          items: ClinicalFoundations
        },
        {
          id: 'Developer Type',
          Field: AutoCompleteSelect,
          items: DeveloperTypes
        }
      ]}
      {...other}
    />
  );
}
