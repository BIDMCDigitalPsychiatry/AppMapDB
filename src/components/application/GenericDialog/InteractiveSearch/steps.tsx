import MultiSelectImage from '../../DialogField/MultiSelectImage';
import { PlatformImages, FeatureImages } from '../../../../database/models/Application';
import LabelCenter from '../../DialogField/LabelCenter';
import exportdata from '../../../../images/exportdata.png';
import noexportdata from '../../../../images/noexportdata.png';
import lock from '../../../../images/lock.png';
import unlock from '../../../../images/unlock.png';

const steps = [
  {
    fields: [
      {
        id: 'label1',
        label: 'On which platform(s) are you looking for an app?',
        Field: LabelCenter,
        xs: 12
      },
      {
        id: 'Platforms',
        label: 'Platforms',
        Field: MultiSelectImage,
        items: PlatformImages
      }
    ]
  },
  {
    fields: [
      {
        id: 'label2',
        label: 'Are you looking for a free app?',
        Field: LabelCenter,
        xs: 12
      },
      {
        id: 'Free',
        label: null,
        Field: MultiSelectImage,
        replace: true,
        items: [
          { value: true, label: 'Yes, the app must be totally free!', image: '' },
          { value: false, label: 'No, the app can cost money.', image: '' }
        ],
        tooltip: 'Selecting this option will not exclude any apps, even the totally free ones.'
      },
      {
        id: 'Cost',
        hidden: true
      }
    ]
  },
  {
    fields: [
      {
        id: 'label3',
        label: 'What features are you looking for in an app?',
        Field: LabelCenter,
        xs: 12
      },
      {
        id: 'Features',
        label: 'Features',
        Field: MultiSelectImage,
        items: FeatureImages
      }
    ]
  },
  {
    fields: [
      {
        id: 'label4',
        label: 'Would you like your app to have a privacy policy that specifies data use?',
        Field: LabelCenter,
        xs: 12
      },
      {
        id: 'YesNoPrivacy',
        label: null,
        Field: MultiSelectImage,
        replace: true,
        items: [
          { value: true, label: 'Yes!', image: lock },
          { value: false, label: `No`, image: unlock }
        ]
      },
      {
        id: 'Privacy',
        hidden: true
      }
    ]
  },
  {
    fields: [
      {
        id: 'label5',
        label: 'Do you want to be able to export and share your data?',
        Field: LabelCenter,
        xs: 12
      },
      {
        id: 'YesNoFunctionality',
        label: null,
        Field: MultiSelectImage,
        replace: true,
        items: [
          { value: true, label: 'Yes!', image: exportdata },
          { value: false, label: `No`, image: noexportdata }
        ]
      },
      {
        id: 'Functionalities',
        hidden: true
      }
    ]
  }
  /*{
    fields: [
      {
        id: 'label5',
        label: 'Would you like any more advanced filters?',
        Field: LabelCenter,
        xs: 12
      },
      {
        id: 'FilterContent',
        label: null,
        Field: FilterContentInteractive
      }
    ]
  }*/
];

export default steps;
