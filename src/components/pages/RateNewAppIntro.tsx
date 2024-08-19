import * as React from 'react';
import { Link, Typography, Box, Divider, Button, Grid } from '@mui/material';
import { useHandleChangeRoute } from '../layout/hooks';
import { publicUrl } from '../../helpers';
import { useSignedInRater } from '../../hooks';
import ReactPlayer from 'react-player';
import useWidth from '../layout/ViewPort/hooks/useWidth';

const contentPath = require('../../content/zoom_0.mp4');

export default function RateNewAppIntro() {
  const handleChangeRoute = useHandleChangeRoute();
  const signedInRater = useSignedInRater();
  const width = useWidth();

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
          <Button disabled={!signedInRater} size='large' color='primary' variant='contained' onClick={handleChangeRoute(publicUrl('/RateNewApp'))}>
            Begin Rating
          </Button>
        </Typography>
      </Box>
      <Divider />
      <Box pt={2}>
        <Grid container justifyContent='center'>
          <Grid item xs={12}>
            <Typography variant='h6' align='center'>
              Instructional Video
            </Typography>
          </Grid>
          <Grid item style={{ paddingTop: 16 }} xs={12}>
            <Grid container justifyContent='center'>
              <Grid item>
                <ReactPlayer url={contentPath} controls={true} width={Math.min(width - 32, 640)} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
