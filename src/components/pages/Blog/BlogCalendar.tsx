import React from 'react';
import { Box, Container } from '@mui/material';
import BlogToolbar from './BlogToolbar';
import CommunityCalendar from '../Calendar/CommunityCalendar';

const BlogCalendar = () => {
  return (
    <Container maxWidth='lg'>
      <BlogToolbar />
      <Box py={3}>
        <CommunityCalendar />
      </Box>
    </Container>
  );
};

export default BlogCalendar;
