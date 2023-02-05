import React from 'react';
import { Box, Collapse, Grid, Typography } from '@mui/material';
import IntroVideo from '../../../layout/IntroVideo';

export const title = 'Interactive Search';

export const variableFilters = [
  {
    key: 'Cost',
    availableFilters: ['Totally Free'],
    stepKey: 'Free'
  },
  {
    key: 'Privacy',
    availableFilters: ['Has Privacy Policy', 'App Declares Data Use and Purpose'],
    stepKey: 'YesNoPrivacy'
  },
  {
    key: 'Functionalities',
    availableFilters: ['Email or Export Your Data'],
    stepKey: 'YesNoFunctionality'
  }
];

const height = 32;

export const internalKeys = ['Free', 'YesNoPrivacy', 'YesNoFunctionality', 'YesNoSpanish', 'YesNoOffline', 'YesNoClinicalFoundation'];

export default function InteractiveSearchCard({ id = title, onClose = undefined, state, setState, handleSearch, ...other }) {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(!open);
  };

  return (
    <>
      <Collapse in={open}>
        <Box
          sx={{
            color: 'primary.dark',
            backgroundColor: 'primary.light'
          }}
        >
          {open && <IntroVideo />}
        </Box>
      </Collapse>
      <Grid container alignItems='center' sx={{ height, background: 'transparent' }} justifyContent='center'>
        <Grid item alignContent='center' sx={{ height, width: 320 }}>
          <Box
            color='primary'
            sx={{
              p: 0.5,
              textAlign: 'center',
              backgroundColor: 'primary.dark',
              color: 'white',
              height,
              width: '100%',
              cursor: 'pointer',
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
              '&:hover': {
                backgroundColor: 'primary.main'
              }
            }}
            onClick={handleOpen}
          >
            <Typography>{open ? 'Close video' : `Not sure? Watch this short video!`}</Typography>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
