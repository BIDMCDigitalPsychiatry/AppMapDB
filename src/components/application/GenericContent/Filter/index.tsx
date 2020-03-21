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
  Engagements
} from '../../../../database/models/Application';
import AutoCompleteSelect from '../../DialogField/AutoCompleteSelect';
import { useFullScreen } from '../../../../hooks';

export const title = 'Apply Filters';
const maxWidth = 340;
const minWidth = 300;

export default function FilterContent({ id = title, advanced, ...other }) {
  const fullScreen = useFullScreen();
  const width = fullScreen ? 290 : 700;
  const hidden = !advanced;
  return (
    <GenericContent
      id={id}
      submitLabel={null}
      cancelLabel='Close'
      width={width}
      fields={[
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
          id: 'Developer Type',
          Field: AutoCompleteSelect,
          items: DeveloperTypes,
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
          style: { minWidth, maxWidth },
          hidden
        },
        {
          id: 'Conditions',
          label: 'Supported Conditions',
          Field: MultiSelectCheck,
          items: Conditions.map(label => ({ value: label, label })),
          style: { minWidth, maxWidth },
          hidden
        },
        {
          id: 'Engagements',
          Field: MultiSelectCheck,
          items: Engagements.map(label => ({ value: label, label })),
          style: { minWidth, maxWidth },
          hidden
        },
        {
          id: 'Privacy',
          Field: MultiSelectCheck,
          items: Privacies.map(label => ({ value: label, label })),
          style: { minWidth, maxWidth },
          hidden
        },
        {
          id: 'Clinical Foundation',
          Field: AutoCompleteSelect,
          items: ClinicalFoundations,
          style: { minWidth, maxWidth },
          hidden
        },
        {
          id: 'selfHelp',
          label: 'App is a Self-Help Tool',
          Field: AutoCompleteSelect,
          items: [
            { label: 'Yes', value: true },
            { label: 'No', value: false }
          ],
          style: { minWidth, maxWidth },
          hidden
        },
        {
          id: 'hybridUse',
          label: 'Use with Clinician/Treatment Plan',
          Field: AutoCompleteSelect,
          items: [
            { label: 'Yes', value: true },
            { label: 'No', value: false }
          ],
          style: { minWidth, maxWidth },
          hidden
        },
        {
          id: 'referenceApp',
          label: 'App is a Reference App',
          Field: AutoCompleteSelect,
          items: [
            { label: 'Yes', value: true },
            { label: 'No', value: false }
          ],
          style: { minWidth, maxWidth },
          hidden
        }
      ]}
      {...other}
    />
  );
}
