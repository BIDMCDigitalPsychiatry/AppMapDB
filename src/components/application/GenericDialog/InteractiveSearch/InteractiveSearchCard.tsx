import React from 'react';
import { Box, Collapse, Grid, Typography } from '@mui/material';
import * as Icons from '@mui/icons-material';
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
        <Box sx={{ backgroundColor: '#101826', py: { xs: 1.5, sm: 3 } }}>
          <Box sx={{ maxWidth: 760, mx: 'auto', px: 2 }}>
            <Box sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)' }}>{open && <IntroVideo />}</Box>
          </Box>
        </Box>
      </Collapse>
      <Grid container alignItems='center' sx={{ height, background: 'transparent' }} justifyContent='center'>
        <Grid item>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 2.5,
              height,
              backgroundColor: 'primary.dark',
              color: 'white',
              cursor: 'pointer',
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
              '&:hover': {
                backgroundColor: 'primary.main'
              }
            }}
            onClick={handleOpen}
          >
            {open ? <Icons.Close sx={{ fontSize: 18 }} /> : <Icons.PlayCircleOutline sx={{ fontSize: 18 }} />}
            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{open ? 'Close video' : 'Not sure? Watch this short video!'}</Typography>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
