import MultiSelectCheck from '../../DialogField/MultiSelectCheck';
import Radio from '../../DialogField/Radio';
import {
  Platforms,
  DeveloperTypes,
  Features,
  Conditions,
  Privacies,
  Functionalities,
  Costs,
  ClinicalFoundations,
  Outputs,
  Inputs,
  Engagements
} from '../../../../database/models/Application';
import Rating from '../../DialogField/Rating';
import { tables } from '../../../../database/dbConfig';
import { isEmpty, getAndroidIdFromUrl, getAppleIdFromUrl } from '../../../../helpers';
import AutoCompleteSelect from '../../DialogField/AutoCompleteSelect';
import SupportedPlatforms from './templates/SupportedPlatforms';
import ApplicationInfo from './templates/ApplicationInfo';
import AndroidStore from '../../DialogField/AndroidStore';
import AppleStore from '../../DialogField/AppleStore';
import ApplicationProperties from './templates/ApplicationProperties';
import Check from '../../DialogField/Check';
import WholeNumberUpDown from '../../DialogField/WholeNumberUpDown';

const steps = [
  {
    label: 'For each platform, enter associated link or remove if unsupported. Click next to continue.',
    Template: SupportedPlatforms,
    fields: [
      {
        id: 'platforms',
        label: 'Platforms',
        Field: MultiSelectCheck,
        items: Platforms.map(label => ({ value: label, label })),
        required: true,
        initialValue: Platforms
      },
      {
        id: 'androidLink',
        label: 'Enter link to app on Google Play store',
        required: true,
        http: true,
        validate: values => isEmpty(getAndroidIdFromUrl(values.applications['androidLink'])) && 'Invalid Url format.  Must contain the application id.',
        hidden: values => !(Array.isArray(values[tables.applications]?.platforms) && values[tables.applications]?.platforms.includes('Android'))
      },
      {
        id: 'iosLink',
        label: 'Enter link to app on the Apple App store',
        required: true,
        http: true,
        validate: values => isEmpty(getAppleIdFromUrl(values.applications['iosLink'])) && 'Invalid Url format.  Must contain the application id.',
        hidden: values => !(Array.isArray(values[tables.applications]?.platforms) && values[tables.applications]?.platforms.includes('iOS'))
      },
      {
        id: 'webLink',
        label: 'Enter web link to app',
        required: true,
        http: true,
        hidden: values => !(Array.isArray(values[tables.applications]?.platforms) && values[tables.applications]?.platforms.includes('Web'))
      }
    ].map(f => ({ ...f, container: tables.applications }))
  },
  {
    label: 'Enter application information. Click next to continue.',
    Template: ApplicationInfo,
    fields: [
      {
        id: 'androidStore',
        Field: AndroidStore
      },
      {
        id: 'appleStore',
        Field: AppleStore
      },
      {
        id: 'name',
        label: 'Name'
      },
      {
        id: 'company',
        label: 'Company'
      },
      {
        id: 'costs',
        label: 'Costs Associated with Application',
        Field: MultiSelectCheck,
        items: Costs.map(value => ({ value, label: value })),
        disableCloseOnSelect: false,
        required: true
      },
      {
        id: 'developerType',
        label: 'Developer Type',
        Field: Radio,
        items: DeveloperTypes.map(dt => ({ value: dt, label: dt }))
      },
      {
        id: 'features',
        label: 'Features',
        Field: MultiSelectCheck,
        items: Features.map(value => ({ value, label: value }))
      },
      {
        id: 'clinicalFoundation',
        label: 'Clinical Foundation',
        Field: AutoCompleteSelect,
        items: ClinicalFoundations,
        required: true,
        initialValue: ClinicalFoundations[0]
      },
      {
        id: 'conditions',
        label: 'Supported Conditions',
        Field: MultiSelectCheck,
        items: Conditions.map(value => ({ value, label: value }))
      },
      {
        id: 'functionalities',
        label: 'Functionality',
        Field: MultiSelectCheck,
        items: Functionalities.map(value => ({ value, label: value }))
      },
      {
        id: 'engagements',
        label: 'Engagements',
        Field: MultiSelectCheck,
        items: Engagements.map(value => ({ value, label: value }))
      },
      {
        id: 'inputs',
        label: 'Inputs',
        Field: MultiSelectCheck,
        items: Inputs.map(value => ({ value, label: value }))
      },
      {
        id: 'outputs',
        label: 'Outputs',
        Field: MultiSelectCheck,
        items: Outputs.map(value => ({ value, label: value }))
      },
      {
        id: 'privacies',
        label: 'Privacy Options',
        Field: MultiSelectCheck,
        items: Privacies.map(value => ({ value, label: value }))
      }
    ].map(f => ({ ...f, container: tables.applications }))
  },
  {
    label: 'Check all that apply and enter remaining properties. Click next to continue.',
    Template: ApplicationProperties,
    fields: [
      {
        id: 'respondToHarm',
        label: 'Is the app equipped to respond to potential harms or safety concerns?',
        Field: Check
      },
      {
        id: 'thirdPartyVendors',
        label: 'Does the app use 3rd party vendors (i.e. google analytics, etc)?',
        Field: Check
      },
      {
        id: 'doesWhatItClaims',
        label: 'Does the app appear to do what it claims to do?',
        Field: Check
      },
      {
        id: 'correctContent',
        label: ' Is the app content well-written, correct, and relevant?',
        Field: Check
      },
      {
        id: 'causeHarm',
        label: 'Can the app cause harm?',
        Field: Check
      },
      {
        id: 'useWarning',
        label: 'Does the app provide any warning for use?',
        Field: Check
      },
      {
        id: 'selfHelp',
        label: 'Is it a self-help/self-management tool?',
        Field: Check
      },
      {
        id: 'referenceApp',
        label: 'Is it a reference app?',
        Field: Check
      },
      {
        id: 'hybridUse',
        label: 'Is it intended for hybrid use with a clinician in conjunction with treatment plan?',
        Field: Check
      },
      {
        id: 'readingLevel',
        label: null,
        Field: WholeNumberUpDown,
        min: 0,
        max: 12,
        required: true
      },
      {
        id: 'feasibilityStudies',
        label: null,
        Field: WholeNumberUpDown,
        min: 0,
        max: 999,
        required: true,
        initialValue: 0
      },
      {
        id: 'feasibilityImpact',
        label: null,
        Field: WholeNumberUpDown,
        min: 0,
        max: 99.9,
        step: 0.1,
        inputProps: {
          decimalScale: 1
        },
        required: true,
        initialValue: 0
      },
      {
        id: 'efficacyStudies',
        label: null,
        Field: WholeNumberUpDown,
        min: 0,
        max: 999,
        required: true,
        initialValue: 0
      },
      {
        id: 'efficacyImpact',
        label: null,
        Field: WholeNumberUpDown,
        min: 0,
        max: 999,
        required: true,
        initialValue: 0
      }
    ].map(f => ({ ...f, container: tables.applications }))
  },

  {
    label: 'Enter rating and review',
    fields: [
      { id: 'name', label: 'Enter name of reviewer', xs: 8, initialValue: 'Anonymous', required: true, container: tables.ratings },
      { id: 'rating', label: 'Select Rating', Field: Rating, xs: 4, required: true, container: tables.ratings },
      {
        id: 'review',
        label: 'Enter Review',
        multiline: true,
        rows: 10,
        xs: 12,
        required: true,
        autoFocus: true
      }
    ].map(f => ({ ...f, container: tables.ratings }))
  }
];

export default steps;
