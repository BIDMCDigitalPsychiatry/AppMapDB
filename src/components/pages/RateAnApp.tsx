import * as React from 'react';
import { Grid, Typography, createStyles, makeStyles, Button, Box } from '@material-ui/core';
import Text from '../application/DialogField/Text';

const padding = 32;
const spacing = 1;
const borderRadius = 7;
const minHeight = 200;

const getMobilePadding = breakpoints => ({
  padding,
  fontWeight: 900,
  [breakpoints.down('sm')]: {
    padding: getPadding('sm')
  },
  [breakpoints.down('xs')]: {
    padding: getPadding('xs')
  }
});

const getPadding = (bp, multiplier = 1) => (bp === 'sm' ? padding / 2 : bp === 'xs' ? padding / 3 : padding) * multiplier;

const useStyles = makeStyles(({ breakpoints, palette, spacing, layout }: any) =>
  createStyles({
    root: {
      fontWeight: 900,
      ...getMobilePadding(breakpoints)
    },
    primaryButton: {
      header: {
        background: palette.primary.light,
        color: palette.common.white,
        fontWeight: 900,
        ...getMobilePadding(breakpoints)
      },

      borderRadius,
      color: palette.common.white,
      background: palette.primary.dark,
      minWidth: 160,
      height: 40,
      '&:hover': {
        background: palette.primary.main
      }
    },
    primaryText: {
      fontSize: 32,
      fontWeight: 900,
      color: palette.primary.dark
    },
    container: {
      ...getMobilePadding(breakpoints),
      minHeight,
      borderRadius
    },
    infoContainer: {
      ...getMobilePadding(breakpoints),
      minHeight,
      background: palette.primary.light,
      color: palette.common.white,
      borderRadius
    },
    primaryLabel: {
      color: palette.primary.dark
    }
  })
);

const fields = {
  'Full Name:': { placeholder: 'Full Name' },
  'Title:': { placeholder: 'Title' },
  'Email address:': { placeholder: 'Email address' },
  'Institution:': { placeholder: 'Institution name' },
  'How did you hear about us?': { placeholder: 'Enter information', multiline: true, rows: 3 }
};

export default function RanAnApp() {
  const classes = useStyles();

  // const [state, setState] = React.useState();

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} sm={5} md={7} lg={8}>
        <Grid container alignItems='center' spacing={spacing} className={classes.container}>
          <Grid item xs={12}>
            <Typography variant='h1' className={classes.primaryText}>
              Rate An App
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography color='textSecondary'>
              Our database is sourced by app reviews from trained app raters. Rating an app is an interactive process based on the principles of the American
              Psychiatric Association's App Evaluation Model. Raters will be prompted through 105 different questions about an app and its features, privacy
              settings, clinical foundations and more.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box mt={2}>
              <Typography variant='h1' className={classes.primaryText}>
                Our Review Approach
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography color='textSecondary'>
              We welcome app raters from all backgrounds. The training program is an interactive, self-paced online process lasting about three hours, after
              which trainees contribute their ratins to the database. Raters are integral members of the database community.
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={7} md={5} lg={4}>
        <Grid container alignItems='center' spacing={0} className={classes.infoContainer}>
          <Grid item xs={12}>
            <Typography variant='h5'>Interested in rating an app?</Typography>
            <Typography variant='body2'>Fill out the following for and we'll get in touch with you.</Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container style={{ marginTop: 8, marginBottom: 8 }} alignItems='center' spacing={1}>
              {Object.keys(fields).map(k => {
                const { placeholder = '', multiline = false, rows = undefined } = fields[k];
                return (
                  <Grid item xs={12}>
                    <Typography variant='body2' className={classes.primaryLabel}>
                      {k}
                    </Typography>
                    <Text placeholder={placeholder} rows={rows} multiline={multiline} margin='dense' InputProps={{ style: { background: 'white' } }} />
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <Button className={classes.primaryButton}>Send</Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
