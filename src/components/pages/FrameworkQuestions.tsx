import * as React from 'react';
import { Typography, Box, Grid, makeStyles, createStyles, Divider, Link, Container } from '@material-ui/core';
import DialogButton from '../application/GenericDialog/DialogButton';
import * as FrameworkDialog from '../application/GenericDialog/Framework';
import * as ObjectiveQuestionsDialog from '../application/GenericDialog/ObjectiveQuestions';
import { useFullScreen } from '../../hooks';
import marked from 'marked';

const contentPatth = require('../../content/FrameworkQuestions.md');

const useStyles = makeStyles(() =>
  createStyles({
    button: {
      marginTop: 32,
      minHeight: 80,
      minWidth: 300
    }
  })
);

export const ContentBox = ({ p = 2, children }) => {
  const fullScreen = useFullScreen();
  return (
    <Box pl={fullScreen ? 1 : p} pr={fullScreen ? 1 : p} pt={fullScreen ? 2 : 4}>
      {children}
    </Box>
  );
};

export default function FrameworkQuestions() {
  const classes = useStyles({});
  const [state, setState] = React.useState({ markdown: 'placeholder' });

  React.useEffect(() => {
    fetch(contentPatth)
      .then(response => {
        return response.text();
      })
      .then(text => {
        setState({
          markdown: marked(text)
        });
      });
  }, [setState]);

  return (
    <section>
      <Container>
        <article dangerouslySetInnerHTML={{ __html: state.markdown }}></article>
      </Container>
      <Container style={{ maxWidth: 800 }}>
        <Grid container alignItems='center' justify='center' spacing={2}>
          <Grid container item xs={6} style={{ minWidth: 300 }} justify='center'>
            <DialogButton
              Module={FrameworkDialog}
              className={classes.button}
              size='large'
              variant='outlined'
              placement='right'
              tooltip='Click to View'
              Icon={null}
            >
              APA App Evaluation Model
            </DialogButton>
          </Grid>
          <Grid container item xs={6} style={{ minWidth: 300 }} justify='center'>
            <DialogButton
              Module={ObjectiveQuestionsDialog}
              className={classes.button}
              size='large'
              variant='outlined'
              placement='right'
              tooltip='Click to View'
              Icon={null}
            >
              Why 105 Objective Questions?
            </DialogButton>
          </Grid>
        </Grid>
      </Container>
    </section>
  );
}

export function FrameworkQuestionsOld() {
  const classes = useStyles({});
  const fullScreen = useFullScreen();

  return (
    <Box pt={2} pb={2}>
      <Typography variant='h4' align='center'>
        {`How do you choose the right app?`}
      </Typography>
      <Divider />
      <ContentBox>
        <Typography variant='h6' align='justify'>
          There are over{' '}
          <Link href='https://jamanetwork.com/journals/jamapsychiatry/article-abstract/2616170' target='_blank'>
            ten thousand apps
          </Link>{' '}
          targeting mental health conditions available for download and use today. These apps offer a range of possibilities for mental health, with the
          potential for symptom monitoring, therapy-inspired exercises, psychoeducation, and connection with a clinician or peer. Although an app can often be
          useful in care, it is important to be cautious about app selection, especially when it comes to app privacy, data use, and effectiveness.
        </Typography>
      </ContentBox>
      <ContentBox>
        <Typography variant='h6' align='justify'>
          The United States Food and Drug Administration (FDA) has taken a “hands-off” approach towards regulating apps. This{' '}
          <Link href='https://www.ncbi.nlm.nih.gov/pubmed/28384700' target='_blank'>
            lack of oversight
          </Link>{' '}
          means that not all available apps are safe and effective, and some may even pose significant dangers to users.
        </Typography>
      </ContentBox>
      <Box pl={fullScreen ? 2 : 4} pr={fullScreen ? 2 : 4} pt={fullScreen ? 2 : 3} pb={fullScreen ? 2 : 3}>
        <Grid container>
          {[
            'Many claims made by apps have not been evaluated in feasibility or efficacy trials.',
            <>
              Apps may offer incorrect or misleading information, including potentially harmful recommendations. In December 2019, a study of apps for
              depression and suicide prevention found that{' '}
              <Link href='https://www.ncbi.nlm.nih.gov/pubmed/28384700' target='_blank'>
                nonexistant or inaccurate suicide crisis helpline phone numbers
              </Link>{' '}
              were provided by apps downloaded more than 2 million times.
            </>,
            <>
              Without stringent regulations, some apps may not securely protect the personal information that they collect. A 2018 analysis of mobile health
              apps revealed that 80% of apps shared health-related data with third parties, and only{' '}
              <Link href='https://ieeexplore.ieee.org/document/8272037' target='_blank'>
                50% of apps shared data securely.
              </Link>{' '}
            </>,
            <>
              Some apps may even{' '}
              <Link href='https://jamanetwork-com.ezp-prod1.hul.harvard.edu/journals/jamanetworkopen/fullarticle/2730782' target='_blank'>
                sell personal data without clearly disclosing it to users.
              </Link>{' '}
              One recent study found that the majority of top-ranked apps for depression and smoking cessation transmitted data for advertising and marketing
              purposes to Facebook and Google, but fewer than half of these apps disclosed this data sharing in the privacy policy.
            </>
          ].map((line, i) => (
            <Grid item key={i} xs={12}>
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
      <Box pl={fullScreen ? 0 : 2} pr={fullScreen ? 0 : 2} pt={1}>
        <Typography variant='h6' align='justify'>
          As apps continue to emerge and evolve, there are still many unknowns about the efficacy of technology-based interventions.
        </Typography>
      </Box>
      <ContentBox>
        <Typography variant='h6' align='justify'>
          When trying to find a safe and effective app in light of these dangers, many users turn to app store metrics like stars and numbers of downloads.
          These app store metrics, however, can be misleading. The{' '}
          <Link href='https://search-proquest-com.ezp-prod1.hul.harvard.edu/docview/1848800386?accountid=11311&rfr_id=info%3Axri%2Fsid%3Aprimo' target='_blank'>
            app store score is not strongly correlated with clinical utility
          </Link>
          ,and even the most popular apps (those with more than 10,000 downloads) have been shown to have strikingly{' '}
          <Link href='https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6785720/' target='_blank'>
            low engagement
          </Link>
          , hampering therapeutic effectiveness. Although numerous app evaluation models have emerged in the attempt to help users find a safe and useful app,
          static lists and rankings of “best” apps can also be misleading, as they fail to account for both the{' '}
          <Link href='https://mhealth.jmir.org/2016/3/e96/' target='_blank'>
            continuous updates that apps undergo
          </Link>{' '}
          and the substantial variation among individuals: just as there is no one “best” medication or “best” form of therapy, different people react to and
          use apps differently and have varying clinical needs.
        </Typography>
      </ContentBox>
      <ContentBox>
        <Typography variant='h6' align='justify'>
          So how DO you choose an app? The best way is to start by identifying user priorities: how do they want to engage with the app? What features do they
          desire? Is there a particular standard of privacy they seek? Recognizing that app choice is a personal decision based on many individual factors,{' '}
          <div style={{ display: 'inline', fontWeight: 'bold' }}>
            the goal of this database is to equip users with the information necessary to make a decision based on the app characteristics that matter most to
            them.
          </div>{' '}
          Each app’s entry in the database is informed by 105 objective questions based on the{' '}
          <Link href='https://www.psychiatry.org/psychiatrists/practice/mental-health-apps/app-evaluation-model' target='_blank'>
            American Psychiatric Association’s App Evaluation Model
          </Link>
          , which introduces Accessibility, Privacy & Security, Clinical Foundation, Engagement Style, and Interoperability as major categories to consider.
        </Typography>
      </ContentBox>

      <Container style={{ maxWidth: 800 }}>
        <Grid container alignItems='center' justify='center' spacing={2}>
          <Grid container item xs={6} style={{ minWidth: 300 }} justify='center'>
            <DialogButton
              Module={FrameworkDialog}
              className={classes.button}
              size='large'
              variant='outlined'
              placement='right'
              tooltip='Click to View'
              Icon={null}
            >
              APA App Evaluation Model
            </DialogButton>
          </Grid>
          <Grid container item xs={6} style={{ minWidth: 300 }} justify='center'>
            <DialogButton
              Module={ObjectiveQuestionsDialog}
              className={classes.button}
              size='large'
              variant='outlined'
              placement='right'
              tooltip='Click to View'
              Icon={null}
            >
              Why 105 Objective Questions?
            </DialogButton>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
