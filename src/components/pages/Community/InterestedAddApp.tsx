import { Box, Button, Typography } from '@mui/material';
import { useHandleChangeRoute } from '../../layout/hooks';
import { publicUrl } from '../../../helpers';
import { useT } from '../../../i18n';

const InterestedAddApp = () => {
  // In-app submission form (replaced the Google Form, Oct 2026) — submissions
  // land in Admin > App Suggestions.
  const t = useT();
  const changeRoute = useHandleChangeRoute();

  return (
    <Box sx={{ pl: 2, pr: 2, pb: 3 }}>
      <Typography sx={{ color: 'primary.main', textAlign: 'left', fontSize: 18, fontWeight: 700 }}>{t('Interested in adding an app to MIND?')}</Typography>
      <Typography variant='body2' sx={{ mt: 0.5, mb: 1.5 }}>
        {t("Fill out these questions for our team to review, and we'll get back to you soon!")}
      </Typography>
      <Button variant='contained' onClick={changeRoute(publicUrl('/SuggestApp'))} sx={{ textTransform: 'none' }}>
        {t('Suggest an App')}
      </Button>
    </Box>
  );
};

export default InterestedAddApp;
