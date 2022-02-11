import React from 'react';
import { Box, Container } from '@mui/material';
import CommunityToolbar from './CommunityToolbar';
import CommunityCalendar from '../Calendar/CommunityCalendar';

const CommunityCalendarLayout = () => {
  return (
    <Container maxWidth='lg'>
      <CommunityToolbar />
      <Box py={3}>
        <CommunityCalendar />
      </Box>
    </Container>
  );
};

export default CommunityCalendarLayout;
