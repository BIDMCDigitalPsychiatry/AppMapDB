/*
 * Building blocks for "Submit an App". Every question shows its plain
 * wording, an always-visible one-line hint (works on phones — no hover-only
 * tooltips), and an optional "More info" panel that expands in place.
 */
import * as React from 'react';
import {
  Alert,
  Box,
  Checkbox,
  Collapse,
  FormControlLabel,
  FormHelperText,
  Link,
  Radio,
  RadioGroup,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import * as Icons from '@mui/icons-material';
import { HelpItem, NOT_SURE_HINT } from './content';
import { YesNoUnsure } from '../../../database/appSubmissions';

// Renders help text: blank lines separate paragraphs; lines starting with
// "• " become a bulleted list.
export const HelpText = ({ text }: { text: string }) => (
  <>
    {text.split('\n\n').map((para, i) =>
      para.split('\n').every(l => l.startsWith('• ')) ? (
        <Box component='ul' key={i} sx={{ m: 0, pl: 2.5 }}>
          {para.split('\n').map(l => (
            <Typography component='li' variant='body2' key={l}>
              {l.slice(2)}
            </Typography>
          ))}
        </Box>
      ) : (
        <Typography variant='body2' key={i} sx={{ mb: 1, '&:last-child': { mb: 0 } }}>
          {para}
        </Typography>
      )
    )}
  </>
);

export const MoreInfo = ({ text }: { text?: string }) => {
  const [open, setOpen] = React.useState(false);
  if (!text) return null;
  return (
    <Box sx={{ mt: 0.5 }}>
      <Link
        component='button'
        type='button'
        variant='body2'
        underline='hover'
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 600, minHeight: 36, pr: 1 }}
      >
        <Icons.InfoOutlined sx={{ fontSize: 16 }} />
        {open ? 'Less info' : 'More info'}
      </Link>
      <Collapse in={open}>
        <Box sx={{ mt: 1, p: 1.5, borderRadius: 1, bgcolor: 'action.hover', borderLeft: 3, borderColor: 'primary.light' }}>
          <HelpText text={text} />
        </Box>
      </Collapse>
    </Box>
  );
};

interface QuestionProps {
  fieldKey: string; // dotted error key; also the scroll target
  label: React.ReactNode;
  hint?: React.ReactNode;
  more?: string;
  error?: string;
  optional?: boolean;
  control?: React.ReactNode; // shown to the right of the label on wide screens
  children?: React.ReactNode; // shown below the label
}

export const Question = ({ fieldKey, label, hint, more, error, optional, control, children }: QuestionProps) => (
  <Box
    data-field={fieldKey}
    sx={{
      py: 2,
      // Dividers separate the stacked Yes/No rows; text fields (which can sit
      // side by side in a grid) just get spacing.
      ...(control ? { borderBottom: 1, borderColor: 'divider', '&:last-of-type': { borderBottom: 0 } } : {}),
      ...(error ? { bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(244,67,54,0.08)' : 'rgba(244,67,54,0.04)'), mx: -2, px: 2 } : {})
    }}
  >
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: control ? 'row' : 'column' }, gap: { xs: 1, sm: 2 }, alignItems: { sm: control ? 'flex-start' : 'stretch' } }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600 }}>
          {label}
          {optional && (
            <Typography component='span' variant='body2' color='text.secondary' sx={{ fontWeight: 400 }}>
              {' '}
              (optional)
            </Typography>
          )}
        </Typography>
        {hint && (
          <Typography variant='body2' color='text.secondary' sx={{ mt: 0.25 }}>
            {hint}
          </Typography>
        )}
        <MoreInfo text={more} />
      </Box>
      {control && <Box sx={{ flexShrink: 0 }}>{control}</Box>}
    </Box>
    {children && <Box sx={{ mt: 1.5 }}>{children}</Box>}
    {error && <FormHelperText error>{error}</FormHelperText>}
  </Box>
);

export const YesNoUnsureToggle = ({
  value,
  onChange,
  allowUnsure = true,
  label
}: {
  value?: YesNoUnsure;
  onChange: (v: YesNoUnsure) => void;
  allowUnsure?: boolean;
  label: string;
}) => (
  <ToggleButtonGroup
    exclusive
    size='small'
    color='primary'
    value={value ?? null}
    onChange={(_, v) => v && onChange(v)}
    aria-label={label}
    sx={{
      // Comfortable touch targets; full width on phones so the choices are easy to hit
      width: { xs: '100%', sm: 'auto' },
      '& .MuiToggleButton-root': {
        textTransform: 'none',
        px: 2,
        py: 0.75,
        minWidth: 64,
        flex: { xs: 1, sm: 'none' },
        fontWeight: 600,
        fontSize: 14,
        color: 'text.primary',
        borderColor: 'grey.400',
        whiteSpace: 'nowrap'
      },
      // MUI's own selected style (pale tint) outranks a plain .Mui-selected rule — match its specificity
      '& .MuiToggleButton-root.Mui-selected, & .MuiToggleButton-root.Mui-selected:hover': { bgcolor: 'primary.main', color: 'common.white' }
    }}
  >
    <ToggleButton value='yes'>Yes</ToggleButton>
    <ToggleButton value='no'>No</ToggleButton>
    {allowUnsure && <ToggleButton value='unsure'>Not sure</ToggleButton>}
  </ToggleButtonGroup>
);

export const YesNoGroup = ({
  name,
  items,
  value = {},
  onAnswer,
  errors,
  followUps = {}
}: {
  name: string; // e.g. 'answers.costs'
  items: HelpItem[];
  value?: Record<string, YesNoUnsure>;
  onAnswer: (path: string, answer: YesNoUnsure) => void; // path = `${name}.${item.value}` (one answer per update, never a stale group copy)
  errors: Record<string, string>;
  followUps?: Record<string, React.ReactNode>; // shown right under that question (e.g. "which accessibility features?")
}) => (
  <Box>
    {items.map(item => (
      <Question
        key={item.value}
        fieldKey={`${name}.${item.value}`}
        label={item.label}
        hint={item.hint}
        more={item.more}
        error={errors[`${name}.${item.value}`]}
        control={<YesNoUnsureToggle label={item.label} value={value[item.value]} onChange={v => onAnswer(`${name}.${item.value}`, v)} />}
      >
        {followUps[item.value] ? <Box sx={{ pl: { sm: 2 }, borderLeft: { sm: 3 }, borderColor: { sm: 'primary.light' } }}>{followUps[item.value]}</Box> : undefined}
      </Question>
    ))}
  </Box>
);

export const ChecklistGroup = ({
  name,
  label,
  hint,
  items,
  value = [],
  onChange,
  error,
  columns = 1
}: {
  name: string;
  label: string;
  hint?: string;
  items: HelpItem[];
  value?: string[];
  onChange: (next: string[]) => void;
  error?: string;
  columns?: 1 | 2;
}) => {
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  return (
    <Box data-field={name} sx={{ py: 2 }}>
      <Typography sx={{ fontWeight: 600 }}>{label}</Typography>
      {hint && (
        <Typography variant='body2' color='text.secondary' sx={{ mt: 0.25 }}>
          {hint}
        </Typography>
      )}
      <Box sx={{ mt: 1.5, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: columns === 2 ? '1fr 1fr' : '1fr' }, gap: 1 }}>
        {items.map(item => {
          const checked = value.includes(item.value);
          return (
            <Box
              key={item.value}
              sx={{
                border: 1,
                borderColor: checked ? 'primary.main' : 'divider',
                bgcolor: checked ? 'rgba(34,120,207,0.06)' : 'background.paper',
                borderRadius: 1.5,
                px: 1.5,
                py: 1,
                transition: 'border-color 120ms, background-color 120ms'
              }}
            >
              <FormControlLabel
                sx={{ alignItems: 'flex-start', m: 0, width: '100%', minHeight: 40 }}
                control={<Checkbox checked={checked} onChange={() => toggle(item.value)} sx={{ p: 0.5, mr: 1 }} />}
                label={
                  <Box sx={{ pt: 0.5 }}>
                    <Typography sx={{ fontWeight: 600 }}>{item.label}</Typography>
                    {item.hint && (
                      <Typography variant='body2' color='text.secondary'>
                        {item.hint}
                      </Typography>
                    )}
                  </Box>
                }
              />
              {item.more && (
                <Box sx={{ pl: 4.5 }}>
                  <MoreInfo text={item.more} />
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </Box>
  );
};

export const TextQuestion = ({
  fieldKey,
  label,
  hint,
  more,
  value,
  onChange,
  error,
  optional,
  multiline,
  rows,
  placeholder,
  type,
  inputProps,
  autoComplete,
  onBlur,
  narrow
}: {
  narrow?: boolean; // short numeric answers: a compact input instead of full width
  fieldKey: string;
  label: string;
  hint?: React.ReactNode;
  more?: string;
  value?: string | number;
  onChange: (v: string) => void;
  error?: string;
  optional?: boolean;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  type?: string;
  inputProps?: any;
  autoComplete?: string;
  onBlur?: () => void;
}) => (
  <Question fieldKey={fieldKey} label={label} hint={hint} more={more} optional={optional}>
    <TextField
      fullWidth
      size='small'
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      error={!!error}
      helperText={error}
      multiline={multiline}
      minRows={rows}
      placeholder={placeholder}
      type={type}
      inputProps={{ 'aria-label': label, ...inputProps }}
      autoComplete={autoComplete}
      sx={narrow ? { maxWidth: 160 } : undefined}
    />
  </Question>
);

export const ChoiceQuestion = ({
  fieldKey,
  label,
  hint,
  options,
  value,
  onChange,
  error,
  optional
}: {
  fieldKey: string;
  label: string;
  hint?: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange: (v: string) => void;
  error?: string;
  optional?: boolean;
}) => (
  <Question fieldKey={fieldKey} label={label} hint={hint} error={error} optional={optional}>
    <RadioGroup value={value ?? ''} onChange={e => onChange(e.target.value)} aria-label={label}>
      {options.map(o => (
        <FormControlLabel key={o.value} value={o.value} control={<Radio size='small' />} label={o.label} />
      ))}
    </RadioGroup>
  </Question>
);

export const SectionIntro = ({ intro, tip, showNotSure }: { intro: string; tip?: string; showNotSure?: boolean }) => (
  <Box sx={{ mb: 1 }}>
    <Typography color='text.secondary'>{intro}</Typography>
    {(tip || showNotSure) && (
      <Alert severity='info' icon={<Icons.LightbulbOutlined fontSize='inherit' />} sx={{ mt: 1.5 }}>
        {tip}
        {tip && showNotSure && ' '}
        {showNotSure && NOT_SURE_HINT}
      </Alert>
    )}
  </Box>
);

export const SubHeading = ({ children }: { children: React.ReactNode }) => (
  <Typography variant='h6' sx={{ mt: 3, mb: 0.5, fontWeight: 700, color: 'primary.dark' }}>
    {children}
  </Typography>
);
