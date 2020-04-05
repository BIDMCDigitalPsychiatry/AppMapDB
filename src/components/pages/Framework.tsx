import * as React from 'react';
import { Link, Typography, Box, Grid } from '@material-ui/core';
import appModel from '../../images/app_model.png';
import { useFullScreen } from '../../hooks';
import NavPills from '../general/NavPills/NavPills';
import * as Icons from '@material-ui/icons';

const ContentBox = ({ p = 2, children }) => {
  const fullScreen = useFullScreen();
  return (
    <Box pl={fullScreen ? 0 : p} pr={fullScreen ? 0 : p} pt={fullScreen ? 2 : 4}>
      {children}
    </Box>
  );
};

export default function Framework({ containerHeight }) {
  const fullScreen = useFullScreen();
  const handleTabChange = React.useCallback((tab) => {}, []);

  return (
    <NavPills
      color='primary'
      alignCenter
      active={0}
      onChange={handleTabChange}
      tabs={[
        {
          tabIcon: Icons.LocalLibrary,
          tabButton: fullScreen ? 'Model' : 'App Evaluation Model',
          tabContent: (
            <ContentBox>
              <Typography variant='h6' align='justify'>
                There are thousands of apps targeting mental health conditions available for download and use today. These apps offer a range of possibilities
                for mental health, with the potential for symptom monitoring, therapy-inspired exercises, psychoeducation, and connection with a clinician or
                peer. Although an app can often be useful in care, it is important to be cautious about app selection, especially when it comes to app privacy,
                data use, and effectiveness. The{' '}
                <Link href='https://www.psychiatry.org/psychiatrists/practice/mental-health-apps/app-evaluation-model' target='_blank'>
                  American Psychiatric Association’s App Evaluation Model
                </Link>{' '}
                is designed to equip individuals with the information needed to assess digital health tools on their own and in the context of a therapeutic
                relationship, ultimately helping to find apps that are safe and useful.
              </Typography>
            </ContentBox>
          )
        },
        {
          tabIcon: Icons.DirectionsWalk,
          tabButton: fullScreen ? 'Caution' : 'Caution When Using Apps',
          tabContent: (
            <ContentBox>
              <Typography variant='h6' align='justify'>
                The United States Food and Drug Administration (FDA) has taken a “hands-off” approach towards regulating apps. This{' '}
                <Link href='https://www.ncbi.nlm.nih.gov/pubmed/28384700' target='_blank'>
                  lack of oversight
                </Link>{' '}
                means that not all available apps are safe and effective.
              </Typography>
              <Box pl={fullScreen ? 2 : 4} pr={fullScreen ? 2 : 4} pt={fullScreen ? 2 : 3} pb={fullScreen ? 2 : 3}>
                <Grid container>
                  {[
                    'Many claims made by apps have not been evaluated in feasibility or efficacy trials.',
                    `Apps may offer incorrect or misleading information, including potentially harmful recommendations. Without stringent regulations,
                    some apps may not securely protect the personal information that they collect.`,
                    `Some apps may even sell personal data without clearly disclosing it to users.`
                  ].map((line) => (
                    <Grid item xs={12}>
                      <Grid container spacing={3}>
                        <Grid item>
                          <Typography variant='h6' align='justify'>
                            {`\u2022`}
                          </Typography>
                        </Grid>
                        <Grid item xs>
                          <Typography variant='h6' align='justify'>
                            {line}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Typography variant='h6' align='justify'>
                As apps continue to emerge and evolve, there are still many unknowns about the efficacy of technology-based interventions.
              </Typography>
            </ContentBox>
          )
        },
        {
          tabIcon: Icons.InfoOutlined,
          tabButton: fullScreen ? 'About' : 'About the Model',
          tabContent: (
            <ContentBox>
              <Typography variant='h6' align='justify'>
                The information to consider when picking an app is not necessarily the same as that used when choosing a medication or therapy. The APA
                Evaluation Model introduces a hierarchical system to evaluate apps with five key levels to consider:
              </Typography>
              <Box pl={fullScreen ? 2 : 4} pr={fullScreen ? 2 : 4} pt={fullScreen ? 2 : 3} pb={fullScreen ? 2 : 3}>
                <Grid container>
                  {[
                    { label: 'Accessibility', text: 'Is the app accessible for a user?' },
                    { label: 'Privacy & Security', text: 'Does the app uphold user safety, security, and privacy by protecting data?' },
                    { label: 'Clinical Foundation', text: ' Is the app supported by research?' },
                    { label: 'Engagement Style', text: 'Is the app usable and customizable?' },
                    { label: 'Data Sharing Towards Therapeutic Goal', text: 'How easily can the app share data in a clinically meaningful way?' }
                  ].map(({ label, text }) => (
                    <Grid item xs={12}>
                      <Grid container spacing={3}>
                        <Grid item>
                          <Typography variant='h6' align='justify'>
                            {`\u2022`}
                          </Typography>
                        </Grid>
                        <Grid item xs>
                          <Typography variant='h6' align='justify'>
                            {label}: {text}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
              </Box>
              <Typography align='center'>
                <img style={{ width: '90%' }} src={appModel} alt='logo' />
              </Typography>
            </ContentBox>
          )
        }
      ]}
    />
  );
}
