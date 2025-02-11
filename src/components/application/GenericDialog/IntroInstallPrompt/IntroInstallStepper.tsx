import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import * as Icons from '@mui/icons-material';

const fontSize = 18;

export default function IntroInstallStepper() {
  return (
    <Box sx={{}}>
      <Stepper orientation='vertical'>
        <Step key={0} active={true}>
          <StepLabel>
            <Box sx={{ fontSize, color: 'text.primary', textAlign: 'left', ml: 2 }}>
              Search{' '}
              <Typography display='inline' sx={{ fontWeight: 'bold' }}>
                pwa.mindapps.org
              </Typography>{' '}
              on your mobile device.
            </Box>
          </StepLabel>
        </Step>
        <Step key={1} active={true}>
          <StepLabel>
            <Box sx={{ display: 'flex', ml: 2 }}>
              <Typography
                sx={{ fontSize, color: 'text.primary', textAlign: 'left', display: 'inline' }}
              >{`Press the share symbol at the bottom or top of your screen.`}</Typography>
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
              >{`Find and Select the "Add to Home Screen" option.`}</Typography>
              <Box sx={{ pt: 0, ml: 2, display: 'inline' }}>
                <Icons.AddBoxOutlined sx={{ fontSize: fontSize * 2 }} />
              </Box>
            </Box>
          </StepLabel>
        </Step>
        <Step key={3} active={true}>
          <StepLabel>
            <Box sx={{ fontSize, color: 'text.primary', textAlign: 'left', ml: 2 }}>Press “Add” in the top right corner.</Box>
          </StepLabel>
        </Step>
        <Step key={4} active={true}>
          <StepLabel>
            <Box sx={{ fontSize, color: 'text.primary', textAlign: 'left', ml: 2 }}>Go to your home screen and find the MINDapps app!</Box>
          </StepLabel>
        </Step>
      </Stepper>
    </Box>
  );
}
