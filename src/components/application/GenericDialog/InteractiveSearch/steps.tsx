import MultiSelectImage from '../../DialogField/MultiSelectImage';
import { PlatformImages, FeatureImages } from '../../../../database/models/Application';
import LabelCenter from '../../DialogField/LabelCenter';

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
  }
];

export default steps;
