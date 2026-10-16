import * as React from 'react';
import { FormControl, Box, FormHelperText, Typography } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { isError, isTrue, onlyUnique, evalFunc } from '../../../helpers';
import OutlinedDiv from '../../general/OutlinedDiv/OutlinedDiv';
import YesNo from './YesNo';
import { useReviewFlags } from './ReviewFlags';
import { useT } from '../../../i18n';

// Light orange row + label for questions the App Suggestion submitter answered "Not sure"
// (only ever non-empty for ratings opened from Admin > App Suggestions — see ReviewFlags.tsx).
const FlaggedRow = ({ reviewed, children }: { reviewed: boolean; children: React.ReactNode }) => {
  const t = useT();
  return (
    <Box
      sx={{
        my: 0.5,
        px: 1,
        pb: 0.5,
        borderRadius: 1,
        borderLeft: 4,
        borderColor: reviewed ? 'success.light' : 'warning.main',
        bgcolor: reviewed ? 'rgba(76, 175, 80, 0.08)' : 'rgba(255, 152, 0, 0.12)'
      }}
    >
      <Typography
        variant='caption'
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pt: 0.5, fontWeight: 700, color: reviewed ? 'success.dark' : 'warning.dark' }}
      >
        {reviewed ? <Icons.CheckCircleOutline sx={{ fontSize: 14 }} /> : <Icons.HelpOutline sx={{ fontSize: 14 }} />}
        {reviewed ? t('Reviewed') : t('Submitter wasn’t sure — please choose Yes or No')}
      </Typography>
      {children}
    </Box>
  );
};

const YesNoGroup = ({
  label = '',
  description = undefined,
  items = [],
  variant = undefined,
  size = 'small' as 'small',
  color = 'primary' as 'primary',
  error = undefined,
  forceErrorMargin = false,
  value = [],
  margin = 'dense' as 'dense',
  onChange = undefined,
  ...other
}) => {
  const t = useT();
  const { flagged, reviewed, markReviewed } = useReviewFlags();

  const handleChange = React.useCallback(
    key => event => {
      const itemValue = event.target.value; // true or false
      markReviewed(key);
      onChange && onChange({ target: { value: isTrue(itemValue) ? [...value, key].filter(onlyUnique) : value.filter(v => v !== key) } });
    },
    [value, onChange, markReviewed]
  );

  const getValue = key => value.includes(key);

  const visible = items.filter(i => !evalFunc(i.hidden, value));
  const toReview = visible.filter(i => flagged.has(i.value) && !reviewed.has(i.value)).length;

  return (
    <FormControl variant={variant} error={isError(error)} fullWidth margin={margin}>
      <OutlinedDiv label={label}>
        <Box mt={1} mb={1}>
          {description && (
            <Typography paragraph={true} color='textSecondary' variant='caption'>
              {t(description)}
            </Typography>
          )}
          {toReview > 0 && (
            <Typography variant='body2' sx={{ mb: 1, color: 'warning.dark', fontWeight: 600 }}>
              {toReview === 1
                ? t('1 answer below needs review — the submitter marked it “Not sure”.')
                : t('{{count}} answers below need review — the submitter marked them “Not sure”.', { count: toReview })}
            </Typography>
          )}
          {visible.map(({ label, value: key, ...more }) => {
            const row = <YesNo label={label} value={flagged.has(key) && !reviewed.has(key) ? undefined : getValue(key)} onChange={handleChange(key)} {...other} {...more} />;
            return (
              <div key={key}>
                {flagged.has(key) ? <FlaggedRow reviewed={reviewed.has(key)}>{row}</FlaggedRow> : row}
              </div>
            );
          })}
          {(forceErrorMargin || error) && <FormHelperText>{t(error)}</FormHelperText>}
        </Box>
      </OutlinedDiv>
    </FormControl>
  );
};

export default YesNoGroup;
