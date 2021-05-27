import * as React from 'react';
import { Box, Container, createStyles, Divider, Grid, makeStyles, Typography } from '@material-ui/core';
import { useFullScreen } from '../../../hooks';
import marked from 'marked';
import DOMPurify from 'dompurify';
import { Pagination } from '@material-ui/lab';
import { isEmpty, publicUrl } from '../../../helpers';
import { useHandleChangeRoute } from '../../layout/hooks';
import { useRouteState } from '../../layout/store';

const articleFile = require('../../../content/Articles/Articles.json');

const useStyles = makeStyles(({ palette }) =>
  createStyles({
    backText: {
      fontWeight: 500
    },
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

const ArticleContent = ({ file, title, subTitle, date }) => {
  const contentPath = require(`../../../content/Articles/${file}`).default;
  const [state, setState] = React.useState({ markdown: '' });
  React.useEffect(() => {
    fetch(contentPath)
      .then(response => {
        return response.text();
      })
      .then(text => {
        setState({
          markdown: DOMPurify.sanitize(marked(text))
        });
      });
  }, [setState, contentPath]);

  const classes = useStyles();

  return (
    <>
      <section>
        <Container>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Grid container justify='space-between'>
                <Grid item>
                  <Typography className={classes.primaryText} variant='h6'>
                    {[title, subTitle].filter(t => !isEmpty(t)).join(' - ')}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography className={classes.primaryLightText}>{date}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <article dangerouslySetInnerHTML={{ __html: state.markdown }}></article>
            </Grid>
          </Grid>
        </Container>
      </section>
    </>
  );
};

export default function Article({ page: Page = 1 }) {
  const [{ page: initialPage = Page }] = useRouteState();
  const [page, setPage] = React.useState(initialPage);

  const handlePageChange = React.useCallback(
    (event, page) => {
      setPage(page);
    },
    [setPage]
  );

  const { articles } = articleFile;

  const article = articles[page - 1];

  const handleChangeRoute = useHandleChangeRoute();

  const classes = useStyles();

  return (
    <section>
      <Container style={{ paddingTop: 24, paddingBottom: 24 }}>
        <Box mb={3} style={{ cursor: 'pointer' }} onClick={handleChangeRoute(publicUrl('/News'), {})}>
          <Typography className={classes.backText}>{`<   Back To News`}</Typography>
        </Box>
        <ArticleContent {...article} />
        <Grid container style={{ marginTop: 24 }} justify='center'>
          {articles.length > 1 && <Pagination page={page} count={articles.length} variant='outlined' shape='rounded' onChange={handlePageChange} />}
        </Grid>
      </Container>
    </section>
  );
}
