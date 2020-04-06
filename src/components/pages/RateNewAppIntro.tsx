import * as React from 'react';
import { Link, Typography, Box, Paper, Container, Divider, Button } from '@material-ui/core';
import rateappscreenshot from '../../images/rateappscreenshot.png';
import { useHandleChangeRoute } from '../layout/hooks';
import { publicUrl } from '../../helpers';
import { useSignedIn } from '../../hooks';

export default function RateNewAppIntro() {
  const handleChangeRoute = useHandleChangeRoute();
  const signedIn = useSignedIn();
  return (
    <Box pt={2}>
      <Typography variant='h4' align='center'>
        {`Rate a New App`}
      </Typography>
      <Divider />
      <Box mt={3}>
        <Typography variant='h6' align='center'>
          {`Rating an app is an interactive process. Raters will be prompted through 105 different questions about an app and its features, privacy settings, clinical foundation, and more. For more information about how to become an app rater, please contact:`}
          <Typography variant='h6' align='center' noWrap component='div'>
            <Link href='mailto:slagan@bidmc.harvard.edu' target='_blank'>
              slagan@bidmc.harvard.edu
            </Link>
          </Typography>
        </Typography>
      </Box>
      <Box mt={3} mb={3}>
        <Typography align='center'>
          <Button disabled={!signedIn} size='large' color='primary' variant='contained' onClick={handleChangeRoute(publicUrl('/RateNewApp'))}>
            Begin Rating
          </Button>
        </Typography>
      </Box>
      <Divider />

      <Container style={{ marginTop: 24, maxWidth: 900 }}>
        <Typography variant='h6'>Example Screenshot:</Typography>
        <Paper>
          <Box pt={1} pb={1}>
            <Typography align='center'>
              <img style={{ width: '100%' }} src={rateappscreenshot} alt='screenshot' />
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
