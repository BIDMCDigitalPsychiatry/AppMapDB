const AWS = require('aws-sdk');

AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:d6802415-4c63-433c-92f5-4a5c05756abe'
});

const dynamo = new AWS.DynamoDB.DocumentClient();

const TableName = 'applications-test';

function isEmpty(str) {
  return !str || 0 === str.length;
}

const getRows = async TableName => {
  let scanResults = [];
  let items;
  var params = {
    TableName,
    ExclusiveStartKey: undefined
  };
  var rows = {};
  do {
    items = await dynamo.scan(params).promise();
    items.Items.forEach(i => scanResults.push(i));
    params.ExclusiveStartKey = items.LastEvaluatedKey;
  } while (typeof items.LastEvaluatedKey != 'undefined');
  rows = scanResults.reduce((f, c) => {
    f[c._id] = c;
    return f;
  }, {});

  return rows;
};

function updateRow(Data) {
  return new Promise(function (resolve, reject) {
    console.log('Updating row: ' + Data?._id);
    dynamo.put({ TableName, Item: Data }, function (err, data) {
      if (err) {
        var message = `(Error processing data.  Table: ${TableName}`;
        console.error({ message, err, TableName, Data });
        reject(err);
      } else {
        console.log('Updated application: ' + Data?._id);
        resolve(true);
      }
    });
  });
}

const isEmptyObject = obj => {
  if (isEmpty(obj)) {
    return true;
  } else if (typeof obj === 'object') {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  } else {
    return false; // Is not empty and is not an object
  }
};

const CostQuestions = [
  { value: 'Free to Download', label: 'Is the app free to download?', tooltip: 'Some apps may be free up front but then have in app purchases.' },
  { value: 'Totally Free', label: 'Is the app totally free?', tooltip: 'No cost up front, no in app purchases.' },
  { value: 'Payment', label: 'Is there a one time payment?' },
  { value: 'In-App Purchase', label: 'Are there in-app purchases?' },
  { value: 'Subscription', label: 'Is there a subscription (recurrent/monthly/annual)?' }
];

const ClinicalFoundationQuestions = [
  {
    value: 'Well Written Relevant Content',
    short: 'Well Written',
    label: 'Is the app content well-written, correct, and relevant?'
  },
  {
    value: 'Does What it Claims',
    short: 'Does as Claims',
    label: 'Does the app appear to do what it claims to do?',
    tooltip: 'If the app claims to offer CBT, for example, is there evidence that CBT is provided on the app?'
  },
  {
    value: 'Patient Facing',
    label: 'Is the app patient facing?',
    tooltip: 'Is the app relevant and intended for an individual with the condition the app relates to?'
  },
  {
    value: 'Can Cause Harm',
    label: 'Can the app cause harm?',
    tooltip:
      "Does the app make recommendations or suggestions that directly defy clinical guidelines? Does it include overtly false information, like a suicide hotline number that doesn't actually work?"
  },
  { value: 'Use Warning', label: 'Does the app specify that it is not a replacement for medical care?' },
  { value: 'Supporting Studies', label: 'Does the app contain supporting studies?' }
];

const hasPrivacyPolicy = value => !value.includes('Has Privacy Policy');

const PrivacyQuestions = [
  { value: 'Has Privacy Policy', short: 'Has Policy', label: 'Is there a privacy policy?' },
  {
    value: 'Data Stored on Device',
    short: 'Device Storage',
    label: 'Is the data stored only on the device?',
    tooltip: 'User data is either stored locally (exclusively on the device) or on a server.',
    hidden: hasPrivacyPolicy
  },
  {
    value: 'Data Stored on Server',
    short: 'Server Storage',
    label: 'Is the data stored on a server?',
    tooltip: 'If the data is stored only on the device, then it won’t be stored on a server.',
    hidden: hasPrivacyPolicy
  },
  {
    value: 'Can Delete Data',
    short: 'Can Delete Data',
    label: 'Can you delete your data?',
    tooltip: 'Can user data be deleted? Some apps may retain data permanently even if the user deletes the app.',
    hidden: hasPrivacyPolicy
  },
  { value: 'App Declares Data Use and Purpose', short: 'Declares Purpose', label: 'Does the app declare data use and purpose?', hidden: hasPrivacyPolicy },
  {
    value: 'App Reports Security Measures in Place',
    short: 'Security Measures',
    label: 'Does the app report security measures in place?',
    hidden: hasPrivacyPolicy
  },
  {
    value: 'Is PHI Shared',
    label: 'Is PHI shared?',
    short: 'PHI Shared',
    tooltip:
      'PHI refers to personal health information that is entered into the app (name, birthday, content of messages, mental health information). Data is shared if it leaves the app in any way.',
    hidden: hasPrivacyPolicy
  },
  {
    value: 'Is De-Identified Data Shared',
    short: 'De-Indentifed Data Shared',
    label: 'Is de-identified data shared?',
    tooltip:
      'De-identified data is information that has been stripped of personally identifiable attributes (Names and identifiers have been stripped, but the individual information remains)',
    hidden: hasPrivacyPolicy
  },
  {
    value: 'Is Anonymized/Aggregate Data Shared',
    short: 'Anonymized Data Shared',
    label: 'Is anonymized/aggregate data shared?',
    tooltip: 'Anonymized data can no longer be associated with an individual in any manner.',
    hidden: hasPrivacyPolicy
  },
  {
    value: 'Can Opt Out of Data Collection',
    short: 'Data Collection Opt Out',
    label: 'Can you opt out of data collection?',
    tooltip: 'Is there a way for a user to indicate that they don’t want to app to collect or share their data?',
    hidden: hasPrivacyPolicy
  },
  { value: 'Meets HIPAA', label: 'Does the app claim to meet HIPAA?', hidden: hasPrivacyPolicy },
  {
    value: 'Has Crisis Management Feature',
    short: 'Crisis Management Feature',
    label: 'Does the app have a crisis management feature?',
    tooltip: 'An app’s emergency response or crisis management feature is often detailed in the privacy policy.',
    hidden: hasPrivacyPolicy
  }
];

const EngagementQuestions = [
  { value: 'User Generated Data', label: 'User generated data?', tooltip: 'Examples include mood tracking, diary app, etc.' },
  { value: 'Chat/Message', label: 'Chat/message based?' },
  { value: 'Assessments/Screenings', label: 'Does app have have screeners/assesments?', tooltip: 'Examples include PHQ9, GAD7, etc.' },
  { value: 'Real Time Response', label: 'Real time response?', tooltip: 'Someone will reply to your chat right away.' },
  {
    value: 'Asynchronous Response',
    label: 'Asynchronous response?',
    tooltip: 'There are no immediate responses to chats. Responses come at predetermined intervals (once a day; every four hours; etc)'
  },
  {
    value: 'Gamification (Points/Badges)',
    short: 'Gamification',
    label: 'Gamification (points, badges)?',
    tooltip: 'User can win points and prizes for engaging with the app.'
  },
  { value: 'Videos', label: 'Videos?' },
  {
    value: 'Audio/Music/Scripts',
    label: 'Audio/music/scripts?',
    tooltip: 'Does the app provide music or audio experiences? Some meditation apps, for example, utilize audio.'
  },
  { value: 'AI Support', label: 'AI support', tooltip: 'Interaction is not with a real person but with a bot.' },
  {
    value: 'Peer Support',
    label: 'Peer support?',
    tooltip: 'Peer is defined as a person with lived experience and support involves actually communicating (so not just watching a video)'
  },
  { value: 'Network Support', label: 'Network support?', tooltip: 'Network is defined as someone (like family or friend) who is actually known.' },
  {
    value: 'Collaborative With Provider/Other',
    short: 'Collaboration',
    label: 'Collaborative with provider/other?',
    tooltip: 'Does it allow for direct collaboration with a provider or clinician? Beyond just being able to share your data'
  }
];

const FunctionalityQuestions = [
  { value: 'Spanish', label: 'Does the app work with Spanish?', tooltip: 'Test it on the app itself and confirm via the app store.' },
  { value: 'Offline', label: 'Does the app work offline?', tooltip: 'Does the app work in airplane mode?' },
  {
    value: 'Accessibility',
    label: 'Does it have at least one accessibility feature?',
    tooltip:
      'Does the app work with the adjustable text size setting of the phone? Or text to voice features? Does the app have an internal setting for increasing text size?'
  },
  {
    value: 'Own Your Own Data',
    short: 'Own Data',
    label: 'Do you own your own data?',
    tooltip: 'This can be found in the privacy policy of the app but is relevant for data sharing capacity. Can a user see and access their data from the app?'
  },
  {
    value: 'Email or Export Your Data',
    short: 'Export Data',
    label: 'Can you email or export your data?',
    tooltip: 'Can data be downloaded or exported, or emailed straight from the app?'
  },
  {
    value: 'Send Your Data to a Medical Record',
    short: 'Send Record',
    label: 'Can you send your data to a medical record?',
    tooltip: 'Does the app sync with EMR? Most apps are not currently equipped with connections to medical record.'
  }
];

const InputQuestions = [
  { value: 'Surveys', label: 'Surveys?', tooltip: 'Does the app enable a user to enter surveys such as mood or symptom surveys?' },
  { value: 'Diary', label: 'Diary?', tooltip: 'Does the app have a journaling, diary, or free writing feature?' },
  { value: 'Geolocation', label: 'Geolocation?', tooltip: 'Does the app enable location services from the phone?' },
  { value: 'Contact List', label: 'Contact List?', tooltip: 'Can a user connect their contact list to the app?' },
  {
    value: 'Camera',
    label: 'Camera?',
    tooltip: 'Do any features of the app utilize camera input? So profile picture? Or photo diary features? Or video chat?'
  },
  { value: 'Microphone', label: 'Microphone?' },
  { value: 'Step Count', label: 'Step Count?', tooltip: 'Does the app utilize step tracking?' },
  {
    value: 'External Devices',
    label: 'External Devices',
    tooltip: `Does the app connect with an external device such as a smart watch or heart rate monitor?`
  },
  {
    value: 'Social Network',
    label: 'Social Network?',
    tooltip: 'Connection to social media. Does the app allow you to input social media information? For example, do you connect it to your facebook to log in?'
  }
];

const OutputQuestions = [
  {
    value: 'Notifications',
    label: 'Notifications?',
    tooltip: 'Does the app send notifications? These notifications could be incoming messages, reminders from the app, or alerts.'
  },
  { value: 'References/Information', label: 'References/Information?', tooltip: 'Does the app provide psychoeducational references or information?' },
  {
    value: 'Social Network',
    label: 'Social Network?',
    tooltip: 'Can you post information from the app to social media? Does the app connect to social media for posting purposes?'
  },

  {
    value: 'Reminders',
    label: 'Reminders?',
    tooltip: 'Does the app allow you to set reminders? (Oftentimes these reminders will then generate notifications)'
  },
  { value: 'Graphs of Data', label: 'Graphs of Data?', tooltip: 'Does the app allow a user to see graphically depicted data?' },
  { value: 'Summary of Data', label: 'Summary of Data?', tooltip: 'Does the app provide written summaries of data (description of data apart from a graph)?' },
  {
    value: 'Link to Formal Care/Coaching',
    label: 'Link to Formal Care/Coaching?',
    tooltip: 'Does the app connect a user with a healthcare provider? A licensed therapist or clinician?'
  }
];

const FeatureQuestions = [
  { value: 'Track Mood', label: 'Does app have mood tracking?' },
  { value: 'Track Medication', label: 'Does app have medication tracking?' },
  {
    value: 'Track Sleep',
    label: 'Does app have sleep tracking?',
    tooltip: 'Does the app track sleep, either in conjunction with a wearable or through user-entered information?'
  },
  { value: 'Track Symptoms', label: 'Does app have symptom tracking?' },
  { value: 'Productivity', label: 'Does app have productivity?' },
  {
    value: 'Physical Health',
    label: 'Does app have physical exercise tracking?',
    tooltip: 'Does it allow a user to track duration or content of physical exercise?'
  },
  {
    value: 'Psychoeducation',
    label: 'Does app have psychoeducation?',
    tooltip: 'Does app provide definitions, explanations of different diagnoses? Is it didactic?'
  },
  { value: 'Journaling', label: 'Does app have journaling?' },
  { value: 'Mindfulness', label: 'Does app have mindfulness?' },
  { value: 'Deep Breathing', label: 'Does app have deep breathing?' },
  {
    value: 'Picture Gallery/Hope Board',
    label: 'Does app have a picture gallery or hope board?',
    tooltip: 'Does the app allow a user to curate a gallery of saved and searched images and quotes?'
  },
  {
    value: 'iCBT or Sleep Therapy',
    label: 'Does app have iCBT or sleep therapy?',
    tooltip: 'Does the app offer sleep therapy of any kind (including iCBT, a targeted sleep intervention)?'
  },
  { value: 'CBT', label: 'Does app have CBT?', tooltip: 'Does the app provide cognitive-behavioral therapy?' },
  { value: 'ACT', label: 'Does app have ACT?', tooltip: 'Does the app provide Acceptance and Commitment Therapy?' },
  { value: 'DBT', label: 'Does app have DBT?', tooltip: 'Does the app provide dialectical behavior therapy?' },
  {
    value: 'Peer Support',
    label: 'Does app have peer support?',
    tooltip: 'Does the app offer connection to peer specialists or individuals with lived experience?'
  },
  {
    value: 'Coach/Therapist Connection',
    label: 'Does have have a connection to coach/therapist?',
    tooltip: 'The app has a built-in way to connect with a provider or coach.'
  },
  { value: 'Biodata', label: 'Does app have biodata tracking?', tooltip: 'Does it collect heart rate, skin conductance, etc.' },
  { value: 'Goal Setting/Habits', label: 'Does app have goal setting/habits?', tooltip: 'Productivity feature allowing user to set and check in on goals.' },

  {
    value: 'Physical Health Exercises',
    label: 'Does app have physical health exercises?',
    tooltip: 'Something like a 7 minute workout that actually gives a workout.  This is a recommendation of exercises, NOT exercise tracking.'
  },
  { value: 'Bbot Interaction', label: 'Does app have chatbot interaction?', tooltip: 'An example would be interaction with a virtual character.' },
  {
    value: 'Bio Feedback with Sense Data',
    label: 'Does app have bio feedback with sense data?',
    tooltip:
      'The app uses biodata to provide feedback/recommendations (an app that will recommend more breathing exercises to respond to high heart rate, for example).'
  }
];

const Conditions = [
  'Mood Disorders',
  'Stress & Anxiety',
  'Sleep',
  'Phobias',
  'OCD',
  'Schizophrenia',
  'Eating Disorders',
  'Personality Disorders',
  'Self-Harm',
  'PTSD',
  'Substance Use',
  'Substance Use (Alcohol)',
  'Substance Use (Smoking & Tobacco)',
  'Headache',
  'Pain',
  'Non-Specific'
];

const DeveloperTypeQuestions = [
  { value: 'Government', label: 'Does it come from the government?' },
  { value: 'For Profit Company', short: 'For Profit', label: 'Does it come from a for-profit company?' },
  { value: 'Non-Profit Company', short: 'Non-Profit', label: 'Does it come from a non-profit company?' },
  { value: 'Healthcare Company', short: 'Healthcare', label: 'Does it come from a trusted healthcare company?' },
  { value: 'Academic Institution', short: 'Academic', label: 'Does it come from an academic institution?' }
];

const UseQuestions = [
  {
    value: 'Self Help',
    label: 'Is app a self-help/self-managment tool?',
    tooltip: 'Provides activities that can be used for self-help and self-management, such as mood or symptom tracking or mindfulness exercises.'
  },
  {
    value: 'Reference',
    label: 'Is app a reference app?',
    tooltip: 'Provides information and references but not necessarily activites.  Psychoeducation first.'
  },
  {
    value: 'Hybrid',
    label: 'Intended for hybrid use with a clinician and treatment plan?',
    tooltip:
      'Is the app intended to be used as an adjunct to care? Apps that have built-in methods of connecting with a provider meet this criteria. However, a teletherapy app would not be intended for hybrid care, as the app replaces in-person care.'
  }
];

const toProcess = [
  { key: 'outputs', list: OutputQuestions },
  { key: 'functionalities', list: FunctionalityQuestions },
  { key: 'uses', list: UseQuestions },
  { key: 'privacies', list: PrivacyQuestions },
  { key: 'features', list: FeatureQuestions },
  { key: 'engagements', list: EngagementQuestions },
  { key: 'costs', list: CostQuestions },
  { key: 'developerTypes', list: DeveloperTypeQuestions },
  { key: 'inputs', list: InputQuestions },
  { key: 'clinicalFoundations', list: ClinicalFoundationQuestions }
  //conditions: Condition[]; // Conditions (no value just value)
];

const compress = app => {
  toProcess.forEach(({ key, list }) => {
    if (!isEmpty(app[key])) {
      var newValues = [];
      app[key].forEach(v => {
        const idx = list.findIndex(li => li.value === v);
        if (idx > 0) {
          newValues.push(idx);
        } else {
          newValues.push(v);
        }
      });
      app[key] = '[' + newValues.join(',') + ']';
      console.log('Compressed ' + app[key]);
    }
  });
  return app;
};

// This syncs the exclude column.
// Items that have exclude = true do not need to be included in the initial snapshot for display in the applications table.
// If an item is restored that was previosly deleted this function may need to be re-executed
const syncAppStoreData = async () => {
  const rows = await getRows(TableName);
  const rowKeys = Object.keys(rows);
  for (let i = 0; i < rowKeys.length; i++) {
    const k = rowKeys[i];
    const { childId, androidStore, appleStore, ...remaining } = rows[k];
    await updateRow({ ...compress(remaining) });

    /*if (isEmpty(childId)) {
      // find the newest child and then link that id
      const child = Object.keys(rows).find(k2 => rows[k2].parent?._id === k && rows[k2].approved === true && rows[k2].delete !== true);
      if (child) {
        await updateRow({ ...remaining, childId: child._id });
      }
    }
    */
  }

  return;
};

syncAppStoreData();
