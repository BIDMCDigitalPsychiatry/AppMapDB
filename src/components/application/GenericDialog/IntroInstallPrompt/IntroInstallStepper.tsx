import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import * as Icons from '@mui/icons-material';
import { useT } from '../../../../i18n';

const fontSize = 18;

export default function IntroInstallStepper() {
  const t = useT();
  // One key for the whole sentence; the URL is a placeholder rendered in bold.
  const [searchBefore, searchAfter = ''] = String(t('Search {{url}} on your mobile device.')).split('{{url}}');
  return (
    <Box sx={{}}>
      <Stepper orientation='vertical'>
        <Step key={0} active={true}>
          <StepLabel>
            <Box sx={{ fontSize, color: 'text.primary', textAlign: 'left', ml: 2 }}>
              {searchBefore}
              <Typography display='inline' sx={{ fontWeight: 'bold' }}>
                pwa.mindapps.org
              </Typography>
              {searchAfter}
            </Box>
          </StepLabel>
        </Step>
        <Step key={1} active={true}>
          <StepLabel>
            <Box sx={{ display: 'flex', ml: 2 }}>
              <Typography
                sx={{ fontSize, color: 'text.primary', textAlign: 'left', display: 'inline' }}
              >{t('Press the share symbol at the bottom or top of your screen.')}</Typography>
              <Box sx={{ pt: 0, ml: 1, display: 'inline' }}>
                <Icons.IosShare sx={{ fontSize: fontSize * 2 }} />
              </Box>
            </Box>
          </StepLabel>
        </Step>
        <Step key={2} active={true}>
          <StepLabel>
            <Box sx={{ display: 'flex', ml: 2 }}>
              <Typography
                sx={{ fontSize, color: 'text.primary', textAlign: 'left', display: 'inline' }}
              >{t('Find and Select the "Add to Home Screen" option.')}</Typography>
              <Box sx={{ pt: 0, ml: 2, display: 'inline' }}>
                <Icons.AddBoxOutlined sx={{ fontSize: fontSize * 2 }} />
              </Box>
            </Box>
          </StepLabel>
        </Step>
        <Step key={3} active={true}>
          <StepLabel>
            <Box sx={{ fontSize, color: 'text.primary', textAlign: 'left', ml: 2 }}>{t('Press “Add” in the top right corner.')}</Box>
          </StepLabel>
        </Step>
        <Step key={4} active={true}>
          <StepLabel>
            <Box sx={{ fontSize, color: 'text.primary', textAlign: 'left', ml: 2 }}>{t('Go to your home screen and find the MINDapps app!')}</Box>
          </StepLabel>
        </Step>
      </Stepper>
    </Box>
  );
}
