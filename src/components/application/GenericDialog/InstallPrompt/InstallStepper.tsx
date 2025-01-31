import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import * as Icons from '@mui/icons-material';

const fontSize = 18;
const StepIcon = props => <Icons.Circle {...props} sx={{ color: 'primary.dark', fontSize: fontSize * 1.5 }} />;

export default function InstallStepper() {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{}}>
      <Stepper orientation='vertical'>
        <Step key={0} active={true}>
          <StepLabel StepIconComponent={StepIcon}>
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
        <Step key={1} active={true}>
          <StepLabel StepIconComponent={StepIcon}>
            <Box sx={{ display: 'flex', ml: 2 }}>
              <Typography
                sx={{ fontSize, color: 'text.primary', textAlign: 'left', display: 'inline' }}
              >{`Select the "Add to Home Screen" option.`}</Typography>
              <Box sx={{ pt: 0, ml: 2, display: 'inline' }}>
                <Icons.AddBoxOutlined sx={{ fontSize: fontSize * 2 }} />
              </Box>
            </Box>
          </StepLabel>
        </Step>
        <Step key={2} active={true}>
          <StepLabel StepIconComponent={StepIcon}>
            <Box sx={{ fontSize, color: 'text.primary', textAlign: 'left', ml: 2 }}>Press “Add” in the top right corner</Box>
          </StepLabel>
        </Step>
      </Stepper>
    </Box>
  );
}
