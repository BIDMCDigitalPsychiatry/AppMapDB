import * as React from 'react';
import { Box, Container, createStyles, Grid, makeStyles, Paper, Typography } from '@material-ui/core';
import { useFullScreen } from '../../../hooks';
import { publicUrl } from '../../../helpers';
import { useHandleChangeRoute } from '../../layout/hooks';
import ArrowButton from '../../general/ArrowButton';

const articleFile = require('../../../content/Articles/Articles.json');

const useStyles = makeStyles(({ palette }) =>
  createStyles({
    primaryText: {
      fontWeight: 700,
      color: palette.primary.dark
    },
    primaryLightText: {
      fontWeight: 600,
      color: palette.primary.light
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

export default function NewsV2() {
  const { articles } = articleFile;

  const handleChangeRoute = useHandleChangeRoute();

  const classes = useStyles();

  return (
    <section>
      <Container style={{ paddingTop: 24, paddingBottom: 24 }}>
        <Typography variant='h6' className={classes.primaryText}>
          News
        </Typography>
        <Typography variant='caption'>Learn more about how our database is being used around the world.</Typography>
        <Grid container style={{ marginTop: 24 }} spacing={3}>
          {articles.map(({ title, subTitle, date }, index) => (
            <Grid item>
              <Paper
                style={{ width: 240, height: 132, padding: 16, paddingTop: 8, cursor: 'pointer' }}
                onClick={handleChangeRoute(publicUrl('/Article'), { page: index + 1 })}
              >
                <Grid container>
                  <Grid item xs={12}>
                    <Typography noWrap variant='caption' className={classes.primaryText}>
                      {date}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography noWrap className={classes.primaryLightText}>
                      {title}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography noWrap variant='caption'>
                      {subTitle}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container style={{ marginTop: 20 }}>
                      <Grid item>
                        <div style={{ marginLeft: -8 }}>
                          <ArrowButton label='View more' onClick={handleChangeRoute(publicUrl('/Article'), { page: index + 1 })} />
                        </div>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </section>
  );
}
