import { emptyForm, prepareForSubmit, toRatingValues, unsureAnswers, validateStep, visibleItems } from './form';
import { ITEMS_BY_FIELD, YES_NO_FIELDS, CHECKLIST_FIELDS } from './content';
import {
  CostQuestions,
  PrivacyQuestions,
  FeatureQuestions,
  EngagementQuestions,
  FunctionalityQuestions,
  ClinicalFoundationQuestions,
  TreatmentApproachQuestions,
  InputQuestions,
  OutputQuestions,
  CountryQuestions,
  DeveloperTypeQuestions
} from '../../../database/models/Application';

describe('Submit an App: content stays in sync with the rating model', () => {
  it('has wording for every rating question (values match stored rating values)', () => {
    const model = {
      costs: CostQuestions,
      privacies: PrivacyQuestions,
      features: FeatureQuestions,
      engagements: EngagementQuestions,
      functionalities: FunctionalityQuestions,
      clinicalFoundations: ClinicalFoundationQuestions,
      treatmentApproaches: TreatmentApproachQuestions,
      inputs: InputQuestions,
      outputs: OutputQuestions,
      countries: CountryQuestions,
      developerTypes: DeveloperTypeQuestions
    };
    Object.entries(model).forEach(([field, questions]) => {
      expect(ITEMS_BY_FIELD[field].map(i => i.value)).toEqual(questions.map(q => q.value));
      ITEMS_BY_FIELD[field].forEach(i => expect(i.label).toBeTruthy());
    });
  });

  it('every field is either a yes/no group or a checklist', () => {
    expect([...YES_NO_FIELDS, ...CHECKLIST_FIELDS].sort()).toEqual(Object.keys(ITEMS_BY_FIELD).sort());
  });
});

describe('Submit an App: validation', () => {
  it('requires contact details and a valid email', () => {
    const f = emptyForm();
    f.submitter = { firstName: 'Ada', lastName: 'L', organization: 'Org', email: 'not-an-email', relationship: 'developer' };
    expect(Object.keys(validateStep('about', f))).toEqual(['submitter.email']);
    f.submitter.email = 'ada@example.com';
    expect(validateStep('about', f)).toEqual({});
  });

  it('requires at least one app link, and links must be full URLs', () => {
    const f = emptyForm();
    f.app = { name: 'Calm' };
    f.pitch = 'Helps';
    expect(validateStep('app', f)['app.links']).toBeTruthy();
    f.app.webLink = 'calm.com';
    expect(validateStep('app', f)['app.webLink']).toBeTruthy();
    f.app.webLink = 'https://calm.com';
    expect(validateStep('app', f)).toEqual({});
  });

  it('requires every yes/no question in a section, but "Not sure" counts as an answer', () => {
    const f = emptyForm();
    f.answers.conditions = ['Sleep'];
    const errors = validateStep('basics', f);
    expect(Object.keys(errors).filter(k => k.startsWith('answers.costs.')).length).toBe(CostQuestions.length);
    f.answers.costs = Object.fromEntries(CostQuestions.map(q => [q.value, 'unsure' as const]));
    f.answers.developerTypes = Object.fromEntries(DeveloperTypeQuestions.map(q => [q.value, 'no' as const]));
    expect(validateStep('basics', f)).toEqual({});
  });

  it('skips the privacy follow-ups when there is no privacy policy', () => {
    const f = emptyForm();
    f.answers.privacies = { 'Has Privacy Policy': 'no' };
    expect(visibleItems('privacies', f).map(i => i.value)).toEqual(['Has Privacy Policy']);
    expect(validateStep('privacy', f)).toEqual({});
    f.answers.privacies = { 'Has Privacy Policy': 'yes' };
    expect(Object.keys(validateStep('privacy', f)).length).toBe(PrivacyQuestions.length - 1);
  });

  it('only asks the study-detail questions when there are studies', () => {
    const f = emptyForm();
    f.research = { feasibilityStudies: 0, efficacyStudies: 0 };
    expect(validateStep('research', f)).toEqual({});
    f.research.efficacyStudies = 2;
    expect(Object.keys(validateStep('research', f)).length).toBeGreaterThan(0);
  });
});

describe('Submit an App: submission → rating pre-fill', () => {
  const submission: any = {
    _id: 'sub-1',
    created: 1,
    updated: 1,
    status: 'new',
    submitter: {},
    app: { name: 'Calm', company: 'Calm.com', iosLink: 'https://apps.apple.com/us/app/calm/id571800810', webLink: 'https://calm.com' },
    research: { feasibilityStudies: 2, efficacyStudies: 1 },
    answers: {
      costs: { 'Free to Download': 'yes', 'Totally Free': 'no', Subscription: 'unsure' },
      countries: { Canada: 'yes', France: 'no' },
      features: ['Track Mood', 'Not A Real Feature'],
      conditions: ['Sleep'],
      readingLevel: 11
    }
  };

  it('maps Yes answers to selected values; No / Not sure stay unselected; unknown values are dropped', () => {
    const { applications } = toRatingValues(submission) as any;
    expect(applications.platforms).toEqual(['iOS', 'Web']);
    expect(applications.name).toBe('Calm');
    expect(applications.costs).toEqual(['Free to Download']);
    expect(applications.countries).toEqual(['Canada']);
    expect(applications.features).toEqual(['Track Mood']);
    expect(applications.conditions).toEqual(['Sleep']);
    expect(applications.readingLevel).toBe(11);
    expect(applications.feasibilityStudies).toBe(2);
    expect(applications.submissionId).toBe('sub-1');
  });

  it('lists "Not sure" answers for the reviewer', () => {
    expect(unsureAnswers(submission)).toEqual([{ field: 'costs', value: 'Subscription', label: expect.any(String) }]);
  });

  it('drops answers to questions hidden at submit time', () => {
    const f = emptyForm();
    f.answers.privacies = { 'Has Privacy Policy': 'no', 'Meets HIPAA': 'yes' };
    f.research = { feasibilityStudies: 0, efficacyStudies: 0, rctDigital: 'yes' };
    const out = prepareForSubmit(f);
    expect(out.answers.privacies).toEqual({ 'Has Privacy Policy': 'no' });
    expect(out.research.rctDigital).toBeUndefined();
  });
});
