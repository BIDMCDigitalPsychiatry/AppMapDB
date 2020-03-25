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
  DeveloperTypes,
  Engagements
} from '../../../../database/models/Application';
import AutoCompleteSelect from '../../DialogField/AutoCompleteSelect';
import { useFullScreen } from '../../../../hooks';

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
          id: 'Developer Type',
          Field: MultiSelectCheck,
          items: DeveloperTypes.map(label => ({ value: label, label }))
        },
        {
          id: 'Functionalities',
          Field: MultiSelectCheck,
          items: Functionalities.map(label => ({ value: label, label }))
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
          id: 'Clinical Foundation',
          Field: AutoCompleteSelect,
          items: ClinicalFoundations
        },        
        {
          id: 'selfHelp',
          label: 'App is a Self-Help Tool',
          Field: AutoCompleteSelect,
          items: [
            { label: 'Yes', value: true },
            { label: 'No', value: false }
          ]
        },
        {
          id: 'hybridUse',
          label: 'Use with Clinician/Treatment Plan',
          Field: AutoCompleteSelect,
          items: [
            { label: 'Yes', value: true },
            { label: 'No', value: false }
          ]
        },
        {
          id: 'referenceApp',
          label: 'App is a Reference App',
          Field: AutoCompleteSelect,
          items: [
            { label: 'Yes', value: true },
            { label: 'No', value: false }
          ]
        }
        /*{
          id: 'correctContent',
          label: 'Well-Written and Relevant Content',
          Field: AutoCompleteSelect,
          items: [
            { label: 'Yes', value: true },
            { label: 'No', value: false }
          ]
        },
        */
      ]}
      {...other}
    />
  );
}
