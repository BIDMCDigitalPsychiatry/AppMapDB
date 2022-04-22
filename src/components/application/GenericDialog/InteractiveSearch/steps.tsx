import MultiSelectImage from '../../DialogField/MultiSelectImage';
import { PlatformImages, FeatureImages } from '../../../../database/models/Application';
import LabelCenter from '../../DialogField/LabelCenter';
import MultiSelectImageTwoLines from '../../DialogField/MultiSelectImageTwoLines';

const steps = [
  {
    fields: [
      {
        id: 'label0',
        label: `Take this brief quiz to help narrow down your app search! You can leave any questions blank by
        clicking ‘next.’ If during the quiz you want to search based on the questions you have answered
        thus far, then click on ‘search now.`,
        Field: LabelCenter,
        xs: 12
      }
    ]
  },
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
          { value: true, label: 'Yes, the app must be totally free!', image: '/images/newfree.png' },
          { value: false, label: 'No, the app can cost money.', image: '/images/newmoney.png' }
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
        Field: MultiSelectImageTwoLines,
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
          { value: true, label: 'Yes!', image: '/images/newlock.png' },
          { value: false, label: `No`, image: '/images/newunlock.png' }
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
          { value: true, label: 'Yes!', image: '/images/www.png' },
          { value: false, label: `No`, image: '/images/newstop.png' }
        ]
      },
      {
        id: 'Functionalities',
        hidden: true
      }
    ]
  },
  {
    fields: [
      {
        id: 'label6',
        label: 'Would you like an app that is available in Spanish?',
        Field: LabelCenter,
        xs: 12
      },
      {
        id: 'YesNoSpanish',
        label: null,
        Field: MultiSelectImage,
        replace: true,
        items: [
          { value: true, label: 'Yes!', image: '/images/hello.png' },
          { value: false, label: `No`, image: '/images/eng.png' }
        ]
      },
      {
        id: 'Functionalities',
        hidden: true
      }
    ]
  },
  {
    fields: [
      {
        id: 'label7',
        label: 'Do you need an app that is available offline i.e, works without access to the interent?',
        Field: LabelCenter,
        xs: 12
      },
      {
        id: 'YesNoOffline',
        label: null,
        Field: MultiSelectImage,
        replace: true,
        items: [
          { value: true, label: 'Yes!', image: '/images/wifi.png' },
          { value: false, label: `No`, image: '/images/nowifi.png' }
        ]
      },
      {
        id: 'Functionalities',
        hidden: true
      }
    ]
  },
  {
    fields: [
      {
        id: 'label8',
        label: `Are you looking for an app that has published research on the app's abilities i.e., has clinical foundation to support claims?`,
        Field: LabelCenter,
        xs: 12
      },
      {
        id: 'YesNoClinicalFoundation',
        label: null,
        Field: MultiSelectImage,
        replace: true,
        items: [
          { value: true, label: 'Yes!', image: '/images/magnifyresults.png' },
          { value: false, label: `No`, image: '/images/idk_mod.png' }
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
