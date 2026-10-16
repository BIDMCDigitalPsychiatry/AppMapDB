/*
 * The screens of "Submit an App", one per StepId. Wording comes from
 * content.ts; validation from form.ts.
 */
import * as React from 'react';
import Axios from 'axios';
import { Alert, Box, Button, Chip, CircularProgress, Link, TextField, Typography } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { SubmissionForm } from '../../../database/appSubmissions';
import { googlePlayProxyUrl } from '../../../constants';
import { isEmpty } from '../../../helpers';
import { tx, useT, TFunction } from '../../../i18n';
import * as C from './content';
import { Errors, StepId, hasStudies, visibleItems, STEP_IDS, appleStoreId, playStoreId } from './form';
import { ChecklistGroup, ChoiceQuestion, Question, SectionIntro, SubHeading, TextQuestion, YesNoGroup, YesNoUnsureToggle, HelpText } from './fields';

export type SetField = (path: string, value: any) => void;

export interface StepProps {
  form: SubmissionForm;
  set: SetField;
  errors: Errors;
}

const num = (v: string) => (v.trim() === '' ? undefined : Math.max(0, Number(v)));

/* ----------------------------- Store lookup ----------------------------- */

interface StoreInfo {
  title?: string;
  developer?: string;
  icon?: string;
}

type StoreType = 'apple' | 'google';
const STORE_NAMES: Record<StoreType, string> = { apple: tx('the App Store'), google: 'Google Play' };

// One cache per page load: re-typing a link that was already looked up doesn't call the proxy again.
const storeCache = new Map<string, StoreInfo | null>();

const fetchStoreInfo = async (appId: string, type: StoreType): Promise<StoreInfo | null> => {
  const key = `${type}:${appId}`;
  if (storeCache.has(key)) return storeCache.get(key) ?? null;
  try {
    const { data } = await Axios.get(`${googlePlayProxyUrl}?appId=${encodeURIComponent(appId)}&type=${type}`);
    const info = data && data.title ? { title: data.title, developer: data.developer, icon: data.icon } : null;
    storeCache.set(key, info);
    return info;
  } catch {
    return null; // not cached: a network hiccup should be retried next time
  }
};

type LookupState = { status: 'empty' | 'invalid' | 'loading' | 'found' | 'notfound'; info?: StoreInfo };

// Looks up ONE store link. Re-runs whenever that link's app id changes, so the status always
// describes the link currently in the box (never a stale result from the other store).
const useStoreLookup = (type: StoreType, link?: string): LookupState => {
  const appId = type === 'apple' ? appleStoreId(link) : playStoreId(link);
  const [state, setState] = React.useState<LookupState>({ status: 'empty' });
  React.useEffect(() => {
    if (isEmpty(link)) return setState({ status: 'empty' });
    if (!appId) return setState({ status: 'invalid' });
    let cancelled = false;
    setState({ status: 'loading' });
    const timer = setTimeout(async () => {
      const info = await fetchStoreInfo(appId, type);
      if (!cancelled) setState(info ? { status: 'found', info } : { status: 'notfound' });
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [type, appId, link]);
  return state;
};

// Status line shown directly under a store link field.
const StoreLinkStatus = ({ type, lookup, hasError }: { type: StoreType; lookup: LookupState; hasError?: boolean }) => {
  const t = useT();
  const store = t(STORE_NAMES[type]);
  if (lookup.status === 'invalid' && !hasError)
    return (
      <Typography variant='body2' color='text.secondary' sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Icons.InfoOutlined sx={{ fontSize: 16 }} />
        {t('This doesn’t look like a {{store}} link yet — copy the full link from the store page.', { store: type === 'apple' ? 'App Store' : 'Google Play' })}
      </Typography>
    );
  if (lookup.status === 'loading')
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
        <CircularProgress size={16} />
        <Typography variant='body2' color='text.secondary'>
          {t('Checking {{store}}…', { store })}
        </Typography>
      </Box>
    );
  if (lookup.status === 'found' && lookup.info)
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, mt: 1, borderRadius: 1.5, border: 1, borderColor: 'success.light' }}>
        {lookup.info.icon && <img src={lookup.info.icon} alt='' style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0 }} />}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 700 }} noWrap>
            {lookup.info.title}
          </Typography>
          <Typography variant='body2' color='text.secondary' noWrap>
            {lookup.info.developer}
          </Typography>
        </Box>
        <Chip
          size='small'
          color='success'
          icon={<Icons.Check />}
          label={
            <>
              {/* Short label on phones so the app name isn't squeezed; the field above already names the store */}
              <Box component='span' sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {t('Found on {{store}}', { store: type === 'apple' ? 'App Store' : 'Google Play' })}
              </Box>
              <Box component='span' sx={{ display: { xs: 'inline', sm: 'none' } }}>
                {t('Found')}
              </Box>
            </>
          }
          sx={{ flexShrink: 0 }}
        />
      </Box>
    );
  if (lookup.status === 'notfound')
    return (
      <Alert severity='warning' sx={{ mt: 1, py: 0 }}>
        {t('We couldn’t find this app on {{store}}. Please check the link — if it’s right, you can still continue and our reviewers will check it.', { store })}
      </Alert>
    );
  return null; // empty, or invalid (the field shows the format error on Continue)
};

// Different apps behind the two store links (titles share no common word).
const looksLikeDifferentApps = (a?: StoreInfo, b?: StoreInfo) => {
  if (!a?.title || !b?.title) return false;
  const words = (t: string) =>
    new Set(
      t
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(w => w.length > 2)
    );
  const wa = words(a.title);
  return !Array.from(words(b.title)).some(w => wa.has(w));
};

/* -------------------------------- Steps -------------------------------- */

const About = ({ form, set, errors }: StepProps) => (
  <>
    <SectionIntro intro={C.SECTIONS.about.intro} tip={C.SECTIONS.about.tip} />
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, columnGap: 2 }}>
      <TextQuestion
        fieldKey='submitter.firstName'
        label={tx('First name')}
        value={form.submitter.firstName}
        onChange={v => set('submitter.firstName', v)}
        error={errors['submitter.firstName']}
        autoComplete='given-name'
      />
      <TextQuestion
        fieldKey='submitter.lastName'
        label={tx('Last name')}
        value={form.submitter.lastName}
        onChange={v => set('submitter.lastName', v)}
        error={errors['submitter.lastName']}
        autoComplete='family-name'
      />
    </Box>
    <TextQuestion
      fieldKey='submitter.email'
      label={tx('Email')}
      type='email'
      value={form.submitter.email}
      onChange={v => set('submitter.email', v)}
      error={errors['submitter.email']}
      autoComplete='email'
    />
    <TextQuestion
      fieldKey='submitter.organization'
      label={tx('Organization')}
      hint={tx('Your company, university or organization. If you’re an independent developer, put your own name.')}
      value={form.submitter.organization}
      onChange={v => set('submitter.organization', v)}
      error={errors['submitter.organization']}
      autoComplete='organization'
    />
    <ChoiceQuestion
      fieldKey='submitter.relationship'
      label={tx('How are you connected to the app?')}
      options={C.RELATIONSHIPS}
      value={form.submitter.relationship}
      onChange={v => set('submitter.relationship', v)}
      error={errors['submitter.relationship']}
    />
  </>
);

const AppStep = (props: StepProps) => {
  const t = useT();
  const { form, set, errors } = props;
  const apple = useStoreLookup('apple', form.app.iosLink);
  const google = useStoreLookup('google', form.app.androidLink);

  // Fill name/developer from the first store result — only when the person hasn't typed their own.
  const found = apple.info ?? google.info;
  const appRef = React.useRef(form.app);
  appRef.current = form.app;
  React.useEffect(() => {
    if (found?.title && isEmpty(appRef.current.name)) set('app.name', found.title);
    if (found?.developer && isEmpty(appRef.current.company)) set('app.company', found.developer);
  }, [found, set]);

  const lookups: Record<string, { type: StoreType; lookup: LookupState }> = {
    iosLink: { type: 'apple', lookup: apple },
    androidLink: { type: 'google', lookup: google }
  };

  return (
    <>
      <SectionIntro intro={C.SECTIONS.app.intro} />
      <Question
        fieldKey='app.links'
        label={tx('Where can people get the app?')}
        hint={tx('Enter every link that applies — at least one is required.')}
        error={errors['app.links']}
      >
        {(
          [
            ['iosLink', tx('Apple App Store link'), 'https://apps.apple.com/us/app/…/id123456789', undefined],
            ['androidLink', tx('Google Play link'), 'https://play.google.com/store/apps/details?id=…', undefined],
            [
              'webLink',
              tx('Website (for web apps)'),
              'https://…',
              tx('Only if people can use the app in a web browser. Websites aren’t looked up automatically.')
            ]
          ] as const
        ).map(([key, label, placeholder, note]) => (
          <Box key={key} data-field={`app.${key}`} sx={{ mb: 2 }}>
            <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>
              {t(label)}
            </Typography>
            <TextFieldInline
              value={form.app[key]}
              placeholder={placeholder}
              onChange={v => set(`app.${key}`, v.trim())}
              error={errors[`app.${key}`]}
              label={label}
            />
            {note && (
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
                {t(note)}
              </Typography>
            )}
            {lookups[key] && <StoreLinkStatus type={lookups[key].type} lookup={lookups[key].lookup} hasError={!!errors[`app.${key}`]} />}
          </Box>
        ))}
        {looksLikeDifferentApps(apple.info, google.info) && (
          <Alert severity='warning'>
            {t('These two links seem to point to different apps (“{{first}}” and “{{second}}”). Please check that both are for the same app.', {
              first: apple.info?.title,
              second: google.info?.title
            })}
          </Alert>
        )}
      </Question>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, columnGap: 2 }}>
        <TextQuestion fieldKey='app.name' label={tx('App name')} value={form.app.name} onChange={v => set('app.name', v)} error={errors['app.name']} />
        <TextQuestion fieldKey='app.company' label={tx('Developer or company')} optional value={form.app.company} onChange={v => set('app.company', v)} />
      </Box>
      <TextQuestion
        fieldKey='pitch'
        label={tx('Tell us about the app and why it belongs on MINDapps')}
        hint={tx('Who is it for, what does it help with, and what makes it useful? A few sentences is plenty.')}
        multiline
        rows={4}
        value={form.pitch}
        onChange={v => set('pitch', v)}
        error={errors['pitch']}
      />
      {/* Honeypot: invisible to people, tempting to bots. */}
      <Box sx={{ position: 'absolute', left: -10000, width: 1, height: 1, overflow: 'hidden' }} aria-hidden>
        <label>
          Website
          <input tabIndex={-1} autoComplete='off' value={form.website ?? ''} onChange={e => set('website', e.target.value)} />
        </label>
      </Box>
    </>
  );
};

// Plain text input used inside a Question (keeps one label per question).
const TextFieldInline = ({ value, onChange, placeholder, error, label }) => {
  const t = useT();
  return (
    <TextField
      fullWidth
      size='small'
      value={value ?? ''}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      error={!!error}
      helperText={t(error)}
      inputProps={{ 'aria-label': t(label), inputMode: 'url' }}
    />
  );
};

const Eligibility = ({ form, set, errors }: StepProps) => {
  const t = useT();
  return (
    <>
      <SectionIntro intro={C.SECTIONS.eligibility.intro} />
      <Question
        fieldKey='meetsCriteria'
        label={tx('Does the app meet all four criteria?')}
        error={errors['meetsCriteria']}
        control={
          <YesNoUnsureToggle allowUnsure={false} label={tx('Meets all four criteria')} value={form.meetsCriteria} onChange={v => set('meetsCriteria', v)} />
        }
      >
        <Box component='ol' sx={{ m: 0, pl: 3 }}>
          {C.CRITERIA.map(c => (
            <Typography component='li' key={c.label} sx={{ mb: 0.5 }}>
              <b>{t(c.label)}</b>
              <Typography component='span' variant='body2' color='text.secondary'>
                {' '}
                — {t(c.more)}
              </Typography>
            </Typography>
          ))}
        </Box>
      </Question>
      {form.meetsCriteria === 'no' && (
        <TextQuestion
          fieldKey='criteriaNote'
          label={tx('Which criteria doesn’t the app meet, and why?')}
          multiline
          rows={2}
          value={form.criteriaNote}
          onChange={v => set('criteriaNote', v)}
          error={errors['criteriaNote']}
        />
      )}
      <ChecklistGroup
        name='risks'
        label={tx('Which potential risks could apply to the app?')}
        hint={tx('Being open about risks helps our reviewers — it does not count against the app. Select all that apply.')}
        items={C.RISKS}
        value={form.risks}
        onChange={v =>
          set(
            'risks',
            v.includes('None Identified') && !(form.risks ?? []).includes('None Identified')
              ? ['None Identified']
              : v.filter(x => x !== 'None Identified' || v.length === 1)
          )
        }
        error={errors['risks']}
        columns={2}
      />
      {(form.risks ?? []).some(r => r !== 'None Identified') && (
        <TextQuestion
          fieldKey='risksNote'
          label={tx('Please describe these risks and how the app reduces them')}
          optional
          multiline
          rows={3}
          value={form.risksNote}
          onChange={v => set('risksNote', v)}
        />
      )}
    </>
  );
};

const Research = ({ form, set, errors }: StepProps) => {
  const t = useT();
  return (
    <>
      <SectionIntro intro={C.SECTIONS.research.intro} tip={C.SECTIONS.research.tip} />
      <Box>
        <TextQuestion
          fieldKey='research.feasibilityStudies'
          type='number'
          narrow
          inputProps={{ min: 0, max: 999 }}
          label={C.RESEARCH_TEXT.feasibility.label}
          hint={C.RESEARCH_TEXT.feasibility.hint}
          more={C.RESEARCH_TEXT.feasibility.more}
          value={form.research.feasibilityStudies}
          onChange={v => set('research.feasibilityStudies', num(v))}
          error={errors['research.feasibilityStudies']}
        />
        <TextQuestion
          fieldKey='research.efficacyStudies'
          type='number'
          narrow
          inputProps={{ min: 0, max: 999 }}
          label={C.RESEARCH_TEXT.efficacy.label}
          hint={C.RESEARCH_TEXT.efficacy.hint}
          more={C.RESEARCH_TEXT.efficacy.more}
          value={form.research.efficacyStudies}
          onChange={v => set('research.efficacyStudies', num(v))}
          error={errors['research.efficacyStudies']}
        />
      </Box>
      {hasStudies(form) && (
        <>
          <TextQuestion
            fieldKey='research.studyLinks'
            label={C.RESEARCH_TEXT.studyLinks.label}
            hint={C.RESEARCH_TEXT.studyLinks.hint}
            optional
            multiline
            rows={3}
            value={form.research.studyLinks}
            onChange={v => set('research.studyLinks', v)}
          />
          <SubHeading>{t('About your studies')}</SubHeading>
          <Typography variant='body2' color='text.secondary'>
            {t(C.NOT_SURE_HINT)}
          </Typography>
          <ChoiceQuestion
            fieldKey='research.phones'
            optional
            label={C.RESEARCH_CHOICES.phones.label}
            options={C.RESEARCH_CHOICES.phones.options}
            value={form.research.phones}
            onChange={v => set('research.phones', v)}
          />
          <ChoiceQuestion
            fieldKey='research.payment'
            optional
            label={C.RESEARCH_CHOICES.payment.label}
            hint={C.RESEARCH_CHOICES.payment.hint}
            options={C.RESEARCH_CHOICES.payment.options}
            value={form.research.payment}
            onChange={v => set('research.payment', v)}
          />
          {C.RESEARCH_YES_NO.map(q => (
            <Question
              key={q.value}
              fieldKey={`research.${q.value}`}
              label={q.label}
              hint={q.hint}
              error={errors[`research.${q.value}`]}
              control={<YesNoUnsureToggle label={q.label} value={form.research[q.value]} onChange={v => set(`research.${q.value}`, v)} />}
            />
          ))}
          <TextQuestion
            fieldKey='research.followUpDuration'
            optional
            label={C.RESEARCH_FREE_TEXT.followUpDuration.label}
            hint={C.RESEARCH_FREE_TEXT.followUpDuration.hint}
            value={form.research.followUpDuration}
            onChange={v => set('research.followUpDuration', v)}
          />
          <TextQuestion
            fieldKey='research.dropoutRate'
            optional
            type='number'
            narrow
            inputProps={{ min: 0, max: 100 }}
            label={C.RESEARCH_FREE_TEXT.dropoutRate.label}
            hint={C.RESEARCH_FREE_TEXT.dropoutRate.hint}
            value={form.research.dropoutRate}
            onChange={v => set('research.dropoutRate', num(v) === undefined ? undefined : Math.min(100, num(v) as number))}
          />
        </>
      )}
      <TextQuestion
        fieldKey='research.notes'
        optional
        multiline
        rows={2}
        label={C.RESEARCH_FREE_TEXT.notes.label}
        value={form.research.notes}
        onChange={v => set('research.notes', v)}
      />
    </>
  );
};

const Basics = ({ form, set, errors }: StepProps) => {
  const t = useT();
  return (
    <>
      <SectionIntro intro={C.SECTIONS.basics.intro} tip={C.SECTIONS.basics.tip} showNotSure />
      <ChecklistGroup
        name='answers.conditions'
        label={tx('Which conditions does the app support?')}
        hint={tx('Only select conditions the app explicitly says it supports in its description.')}
        items={C.CONDITION_ITEMS}
        value={form.answers.conditions}
        onChange={v => set('answers.conditions', v)}
        error={errors['answers.conditions']}
        columns={2}
      />
      <SubHeading>{t('Cost')}</SubHeading>
      <YesNoGroup name='answers.costs' items={C.COST_ITEMS} value={form.answers.costs} onAnswer={set} errors={errors} />
      <SubHeading>{t('Who makes the app?')}</SubHeading>
      <Typography variant='body2' color='text.secondary'>
        {t('An app can belong to more than one of these — for example, a university hospital is both healthcare and academic.')}
      </Typography>
      <YesNoGroup name='answers.developerTypes' items={C.DEVELOPER_TYPE_ITEMS} value={form.answers.developerTypes} onAnswer={set} errors={errors} />
    </>
  );
};

const Privacy = ({ form, set, errors }: StepProps) => {
  const t = useT();
  return (
    <>
      <SectionIntro intro={C.SECTIONS.privacy.intro} tip={C.SECTIONS.privacy.tip} showNotSure />
      <TextQuestion
        fieldKey='answers.privacyPolicyLink'
        optional
        label={C.PRIVACY_POLICY_LINK.label}
        hint={C.PRIVACY_POLICY_LINK.hint}
        placeholder='https://…'
        value={form.answers.privacyPolicyLink}
        onChange={v => set('answers.privacyPolicyLink', v.trim())}
        error={errors['answers.privacyPolicyLink']}
      />
      <YesNoGroup name='answers.privacies' items={visibleItems('privacies', form)} value={form.answers.privacies} onAnswer={set} errors={errors} />
      {form.answers.privacies?.['Has Privacy Policy'] !== 'no' && (
        <TextQuestion
          fieldKey='answers.readingLevel'
          optional
          type='number'
          narrow
          inputProps={{ min: 0, max: 30, step: 0.1 }}
          label={C.READING_LEVEL.label}
          hint={
            <>
              {t(C.READING_LEVEL.hint)}{' '}
              <Link href={C.READING_LEVEL.link} target='_blank' rel='noopener noreferrer'>
                {t(C.READING_LEVEL.linkLabel)}
              </Link>
            </>
          }
          value={form.answers.readingLevel}
          onChange={v => set('answers.readingLevel', num(v))}
        />
      )}
    </>
  );
};

const Functionality = ({ form, set, errors }: StepProps) => (
  <>
    <SectionIntro intro={C.SECTIONS.functionality.intro} showNotSure />
    <YesNoGroup
      name='answers.functionalities'
      items={C.FUNCTIONALITY_ITEMS}
      value={form.answers.functionalities}
      onAnswer={set}
      errors={errors}
      followUps={{
        Accessibility: form.answers.functionalities?.Accessibility === 'yes' && (
          <TextQuestion
            fieldKey='answers.accessibilityDetails'
            optional
            label={C.ACCESSIBILITY_DETAILS.label}
            hint={C.ACCESSIBILITY_DETAILS.hint}
            value={form.answers.accessibilityDetails}
            onChange={v => set('answers.accessibilityDetails', v)}
          />
        )
      }}
    />
  </>
);

const Clinical = ({ form, set, errors }: StepProps) => {
  const t = useT();
  return (
    <>
      <SectionIntro intro={C.SECTIONS.clinical.intro} tip={C.SECTIONS.clinical.tip} showNotSure />
      <SubHeading>{t('Clinical foundations')}</SubHeading>
      <YesNoGroup name='answers.clinicalFoundations' items={C.CLINICAL_ITEMS} value={form.answers.clinicalFoundations} onAnswer={set} errors={errors} />
      <SubHeading>{t('Treatment approaches')}</SubHeading>
      <YesNoGroup name='answers.treatmentApproaches' items={C.TREATMENT_ITEMS} value={form.answers.treatmentApproaches} onAnswer={set} errors={errors} />
    </>
  );
};

const Features = ({ form, set }: StepProps) => (
  <>
    <SectionIntro intro={C.SECTIONS.features.intro} />
    <ChecklistGroup
      name='answers.features'
      label={tx('Features')}
      items={C.FEATURE_ITEMS}
      value={form.answers.features}
      onChange={v => set('answers.features', v)}
      columns={2}
    />
    <ChecklistGroup
      name='answers.engagements'
      label={tx('How users engage with the app')}
      items={C.ENGAGEMENT_ITEMS}
      value={form.answers.engagements}
      onChange={v => set('answers.engagements', v)}
      columns={2}
    />
  </>
);

const InputsOutputs = ({ form, set }: StepProps) => (
  <>
    <SectionIntro intro={C.SECTIONS.inputsOutputs.intro} tip={C.SECTIONS.inputsOutputs.tip} />
    <ChecklistGroup
      name='answers.inputs'
      label={tx('Inputs — what the app collects')}
      items={C.INPUT_ITEMS}
      value={form.answers.inputs}
      onChange={v => set('answers.inputs', v)}
      columns={2}
    />
    <ChecklistGroup
      name='answers.outputs'
      label={tx('Outputs — what the app gives back')}
      items={C.OUTPUT_ITEMS}
      value={form.answers.outputs}
      onChange={v => set('answers.outputs', v)}
      columns={2}
    />
  </>
);

const Uses = ({ form, set, errors }: StepProps) => {
  const t = useT();
  return (
    <>
      <SectionIntro intro={C.SECTIONS.uses.intro} showNotSure />
      <ChecklistGroup
        name='answers.uses'
        label={tx('What is the app intended for?')}
        hint={tx('Select all that apply.')}
        items={C.USE_ITEMS}
        value={form.answers.uses}
        onChange={v => set('answers.uses', v)}
      />
      <SubHeading>{t('Country availability')}</SubHeading>
      <YesNoGroup name='answers.countries' items={C.COUNTRY_ITEMS} value={form.answers.countries} onAnswer={set} errors={errors} />
    </>
  );
};

const Final = ({ form, set }: StepProps) => (
  <>
    <SectionIntro intro={C.SECTIONS.final.intro} />
    <TextQuestion
      fieldKey='additionalInfo'
      optional
      label={tx('Additional information')}
      hint={tx('Please keep it factual — our reviewers verify everything before an app is listed.')}
      multiline
      rows={5}
      value={form.additionalInfo}
      onChange={v => set('additionalInfo', v)}
    />
  </>
);

/* -------------------------------- Review -------------------------------- */

const ANSWER_LABEL = { yes: tx('Yes'), no: tx('No'), unsure: tx('Not sure') };

const ReviewRow = ({ label, value }: { label: string; value?: React.ReactNode }) => {
  const t = useT();
  return (
    <Box sx={{ display: 'flex', gap: 2, py: 0.75, borderBottom: 1, borderColor: 'divider', flexDirection: { xs: 'column', sm: 'row' } }}>
      <Typography variant='body2' color='text.secondary' sx={{ flex: '0 0 45%' }}>
        {t(label)}
      </Typography>
      <Typography variant='body2' sx={{ fontWeight: 600, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
        {value === undefined || value === '' || (Array.isArray(value) && value.length === 0) ? '—' : value}
      </Typography>
    </Box>
  );
};

export const ReviewSection = ({ title, onEdit, children }: { title: string; onEdit?: () => void; children: React.ReactNode }) => {
  const t = useT();
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        <Typography sx={{ fontWeight: 700, color: 'primary.dark' }}>{t(title)}</Typography>
        {onEdit && (
          <Button startIcon={<Icons.Edit fontSize='small' />} onClick={onEdit} sx={{ ml: 'auto', textTransform: 'none', minHeight: 40 }}>
            {t('Edit')}
          </Button>
        )}
      </Box>
      {children}
    </Box>
  );
};

const yesNoRows = (t: TFunction, items: C.HelpItem[], answers?: Record<string, string>) =>
  items.filter(i => answers?.[i.value]).map(i => <ReviewRow key={i.value} label={i.label} value={t(ANSWER_LABEL[answers?.[i.value] as string])} />);

const labelsFor = (t: TFunction, items: C.HelpItem[], values?: string[]) => (values ?? []).map(v => t(items.find(i => i.value === v)?.label ?? v)).join(', ');

// Read-only summary of a submission; shared by the Review step and the admin queue.
export const SubmissionSummary = ({ form, onEdit }: { form: SubmissionForm; onEdit?: (step: StepId) => void }) => {
  const t = useT();
  const edit = (s: StepId) => (onEdit ? () => onEdit(s) : undefined);
  const r = form.research;
  const a = form.answers;
  return (
    <>
      <ReviewSection title={C.SECTIONS.about.title} onEdit={edit('about')}>
        <ReviewRow label={tx('Name')} value={`${form.submitter.firstName ?? ''} ${form.submitter.lastName ?? ''}`.trim()} />
        <ReviewRow label={tx('Email')} value={form.submitter.email} />
        <ReviewRow label={tx('Organization')} value={form.submitter.organization} />
        <ReviewRow label={tx('Connection to the app')} value={t(C.RELATIONSHIPS.find(x => x.value === form.submitter.relationship)?.label)} />
      </ReviewSection>
      <ReviewSection title={C.SECTIONS.app.title} onEdit={edit('app')}>
        <ReviewRow label={tx('App name')} value={form.app.name} />
        <ReviewRow label={tx('Developer or company')} value={form.app.company} />
        <ReviewRow label='Apple App Store' value={form.app.iosLink} />
        <ReviewRow label='Google Play' value={form.app.androidLink} />
        <ReviewRow label={tx('Website')} value={form.app.webLink} />
        <ReviewRow label={tx('About the app')} value={form.pitch} />
      </ReviewSection>
      <ReviewSection title={C.SECTIONS.eligibility.title} onEdit={edit('eligibility')}>
        <ReviewRow label={tx('Meets all four criteria')} value={form.meetsCriteria && t(ANSWER_LABEL[form.meetsCriteria])} />
        {form.criteriaNote && <ReviewRow label={tx('Criteria not met')} value={form.criteriaNote} />}
        <ReviewRow label={tx('Potential risks')} value={labelsFor(t, C.RISKS, form.risks)} />
        {form.risksNote && <ReviewRow label={tx('About these risks')} value={form.risksNote} />}
      </ReviewSection>
      <ReviewSection title={C.SECTIONS.research.title} onEdit={edit('research')}>
        <ReviewRow label={tx('Feasibility / usability studies')} value={r.feasibilityStudies} />
        <ReviewRow label={tx('Efficacy studies')} value={r.efficacyStudies} />
        {hasStudies(form) && (
          <>
            <ReviewRow label={tx('Study links')} value={r.studyLinks} />
            <ReviewRow label={tx('Phones in studies')} value={t(C.RESEARCH_CHOICES.phones.options.find(o => o.value === r.phones)?.label)} />
            <ReviewRow label={tx('Participant payment')} value={t(C.RESEARCH_CHOICES.payment.options.find(o => o.value === r.payment)?.label)} />
            {yesNoRows(t, C.RESEARCH_YES_NO, r as any)}
            <ReviewRow label={tx('Outcome follow-up')} value={r.followUpDuration} />
            <ReviewRow label={tx('Average drop-out rate')} value={r.dropoutRate !== undefined ? `${r.dropoutRate}%` : undefined} />
          </>
        )}
        {r.notes && <ReviewRow label={tx('Other research notes')} value={r.notes} />}
      </ReviewSection>
      <ReviewSection title={C.SECTIONS.basics.title} onEdit={edit('basics')}>
        <ReviewRow label={tx('Conditions')} value={labelsFor(t, C.CONDITION_ITEMS, a.conditions)} />
        {yesNoRows(t, C.COST_ITEMS, a.costs)}
        {yesNoRows(t, C.DEVELOPER_TYPE_ITEMS, a.developerTypes)}
      </ReviewSection>
      <ReviewSection title={C.SECTIONS.privacy.title} onEdit={edit('privacy')}>
        {a.privacyPolicyLink && <ReviewRow label={tx('Privacy policy')} value={a.privacyPolicyLink} />}
        {yesNoRows(t, visibleItems('privacies', form), a.privacies)}
        {a.readingLevel !== undefined && <ReviewRow label={tx('Privacy policy reading level')} value={a.readingLevel} />}
      </ReviewSection>
      <ReviewSection title={C.SECTIONS.functionality.title} onEdit={edit('functionality')}>
        {yesNoRows(t, C.FUNCTIONALITY_ITEMS, a.functionalities)}
        {a.accessibilityDetails && <ReviewRow label={tx('Accessibility features')} value={a.accessibilityDetails} />}
      </ReviewSection>
      <ReviewSection title={C.SECTIONS.clinical.title} onEdit={edit('clinical')}>
        {yesNoRows(t, C.CLINICAL_ITEMS, a.clinicalFoundations)}
        {yesNoRows(t, C.TREATMENT_ITEMS, a.treatmentApproaches)}
      </ReviewSection>
      <ReviewSection title={C.SECTIONS.features.title} onEdit={edit('features')}>
        <ReviewRow label={tx('Features')} value={labelsFor(t, C.FEATURE_ITEMS, a.features)} />
        <ReviewRow label={tx('Engagement')} value={labelsFor(t, C.ENGAGEMENT_ITEMS, a.engagements)} />
      </ReviewSection>
      <ReviewSection title={C.SECTIONS.inputsOutputs.title} onEdit={edit('inputsOutputs')}>
        <ReviewRow label={tx('Inputs')} value={labelsFor(t, C.INPUT_ITEMS, a.inputs)} />
        <ReviewRow label={tx('Outputs')} value={labelsFor(t, C.OUTPUT_ITEMS, a.outputs)} />
      </ReviewSection>
      <ReviewSection title={C.SECTIONS.uses.title} onEdit={edit('uses')}>
        <ReviewRow label={tx('Intended use')} value={labelsFor(t, C.USE_ITEMS, a.uses)} />
        {yesNoRows(t, C.COUNTRY_ITEMS, a.countries)}
      </ReviewSection>
      <ReviewSection title={C.SECTIONS.final.title} onEdit={edit('final')}>
        <ReviewRow label={tx('Additional information')} value={form.additionalInfo} />
      </ReviewSection>
    </>
  );
};

const Review = ({ form, goTo }: StepProps & { goTo: (step: number) => void }) => (
  <>
    <SectionIntro intro={C.SECTIONS.review.intro} />
    <Alert severity='info' sx={{ my: 2 }}>
      <HelpText
        text={tx(
          'After you send your suggestion, our team reviews every answer and checks the app before it is listed. We may contact you by email if we have questions.'
        )}
      />
    </Alert>
    <SubmissionSummary form={form} onEdit={s => goTo(STEP_IDS.indexOf(s))} />
  </>
);

export const STEP_COMPONENTS: Record<StepId, React.ComponentType<StepProps & { goTo: (step: number) => void }>> = {
  about: About,
  app: AppStep,
  eligibility: Eligibility,
  research: Research,
  basics: Basics,
  privacy: Privacy,
  functionality: Functionality,
  clinical: Clinical,
  features: Features,
  inputsOutputs: InputsOutputs,
  uses: Uses,
  final: Final,
  review: Review
};
