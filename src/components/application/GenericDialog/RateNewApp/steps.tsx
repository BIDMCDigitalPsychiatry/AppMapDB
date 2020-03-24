import MultiSelectCheck from '../../DialogField/MultiSelectCheck';
import { Platforms, DeveloperTypeQuestions, CostQuestions, PrivacyQuestions } from '../../../../database/models/Application';
import { tables } from '../../../../database/dbConfig';
import { isEmpty, getAndroidIdFromUrl, getAppleIdFromUrl } from '../../../../helpers';
import SupportedPlatforms from './templates/SupportedPlatforms';
import ApplicationInfo from './templates/ApplicationInfo';
import AndroidStore from '../../DialogField/AndroidStore';
import AppleStore from '../../DialogField/AppleStore';
import ApplicationProperties from './templates/ApplicationProperties';
import Check from '../../DialogField/Check';
import WholeNumberUpDown from '../../DialogField/WholeNumberUpDown';
import YesNoGroup from '../../DialogField/YesNoGroup';
import PrivacyInfo from './templates/PrivacyInfo';

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
        label: 'Cost',
        Field: YesNoGroup,
        items: CostQuestions
      },
      {
        id: 'developerType',
        label: 'Application Origin',
        description:
          'Every app will be in at least one of these categories but can be in more than one of them (a university-affiliated hospital, for example, could be both academic, healthcare, and non-profit). When in doubt, put for profit. Refer to app store description and app itself (i.e. is there a logo on the interface) and developer website.',
        Field: YesNoGroup,
        items: DeveloperTypeQuestions
      }
      /*{
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
      }
      */
    ].map(f => ({ ...f, container: tables.applications }))
  },
  {
    label: 'Enter privacy/security information. Click next to continue.',
    Template: PrivacyInfo,
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
        id: 'costs',
        label: 'Cost',
        Field: YesNoGroup,
        items: CostQuestions
      },
      {
        id: 'privacies',
        label: 'Privacy & Security',
        Field: YesNoGroup,
        items: PrivacyQuestions
      },
      {
        id: 'readingLevel',
        label: null,
        Field: WholeNumberUpDown,
        min: 0,
        max: 20,
        initialValue: 0
      }
    ].map(f => ({ ...f, container: tables.applications }))
  },
  {
    label: 'Check all that apply and enter remaining properties. Click next to continue.',
    Template: ApplicationProperties,
    fields: [
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
  }
];

export default steps;
