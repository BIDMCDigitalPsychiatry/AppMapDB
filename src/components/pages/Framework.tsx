import * as React from 'react';
import { Link, Typography, Box } from '@material-ui/core';
import appModel from '../../images/app_model.png';
import { useFullScreen } from '../../hooks';

export default function Framework() {
  const fullScreen = useFullScreen();
  return (
    <Box>
      <Typography variant='h4' align='center'>
        This database is based on the{' '}
        <Link href='https://www.psychiatry.org/psychiatrists/practice/mental-health-apps/app-evaluation-model' target='_blank'>
          APA App Evaluation framework
        </Link>
        .
      </Typography>
      <Box p={fullScreen ? 1 : 8}>
        <Typography align='center'>
          <img style={{ width: fullScreen ? '100%' : '80%' }} src={appModel} alt='logo' />
        </Typography>
      </Box>
      <Box pt={2} pl={fullScreen ? 0 : 2} pr={fullScreen ? 0 : 2}>
        <Typography variant='h6' align='center'>
          {`The APA App Evaluation Model is designed to equip individuals with the information they need to assess digital health tools on their own and in the
        context of a therapeutic relationship. The five levels of analysis include (1) accessibility; (2) privacy & security; (3) clinical foundation; (4)
        engagement style; (5) therapeutic goal. 
        `}
        </Typography>
        <Box pt={2}>
          <Typography variant='h6' align='center'>
            {`For further reading about how the framework was developed, please refer to the following papers:`}

            <Typography variant='h6' align='center' noWrap component='span'>
              {`\u2022 `}
              <Link href='https://www.thelancet.com/journals/landig/article/PIIS2589-7500(19)30013-5/fulltext' target='_blank'>
                https://www.thelancet.com/journals/landig/article/PIIS2589-7500(19)30013-5/fulltext
              </Link>
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
