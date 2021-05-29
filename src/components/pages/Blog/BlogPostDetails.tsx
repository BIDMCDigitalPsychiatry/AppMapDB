import { useCallback, useEffect, useState } from 'react';
import type { FC } from 'react';
import { format, subHours } from 'date-fns';
import { Box, Chip, Container, createStyles, Divider, Grid, makeStyles, Typography } from '@material-ui/core';
import { blogApi } from '../../../__fakeApi__/blogApi';
import PencilAltIcon from '../../icons/PencilAlt';
import useMounted from '../../hooks/useMounted';
import BlogPostComment from '../../application/Blog/BlogPostComment';
import { useHandleChangeRoute } from '../../layout/hooks';
import { useRouteState } from '../../layout/store';
import BlogToolbar from './BlogToolbar';
import marked from 'marked';
import DOMPurify from 'dompurify';
import { isEmpty } from '../../../helpers';
import * as Icons from '@material-ui/icons';

const comments = [
  {
    id: 'd0ab3d02ef737fa6b007e35d',
    authorName: 'Alcides Antonio',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    createdAt: subHours(new Date(), 2).getTime()
  },
  {
    id: '3ac1e17289e38a84108efdf3',
    authorName: 'Jie Yan Song',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
    createdAt: subHours(new Date(), 8).getTime()
  }
];

const useStyles = makeStyles(theme =>
  createStyles({
    wrapper: {
      color: theme.palette.text.primary,
      fontFamily: theme.typography.fontFamily,
      '& h2': {
        fontSize: theme.typography.h2.fontSize,
        fontWeight: theme.typography.fontWeightBold,
        lineHeight: theme.typography.h2.lineHeight,
        marginBottom: theme.spacing(3)
      },
      '& h3': {
        fontSize: theme.typography.h3.fontSize,
        fontWeight: theme.typography.fontWeightBold,
        lineHeight: theme.typography.h3.lineHeight,
        marginBottom: theme.spacing(3)
      },
      '& p': {
        fontSize: theme.typography.body1.fontSize,
        lineHeight: theme.typography.body1.lineHeight,
        marginBottom: theme.spacing(2)
      },
      '& li': {
        fontSize: theme.typography.body1.fontSize,
        lineHeight: theme.typography.body1.lineHeight,
        marginBottom: theme.spacing(1)
      }
    }
  })
);

const BlogPostDetails: FC = () => {
  const classes = useStyles();
  const mounted = useMounted();
  const [post, setPost] = useState() as any;
  const handleChangeRoute = useHandleChangeRoute();
  const [{ id }] = useRouteState();

  const getPost = useCallback(async () => {
    try {
      const data = await blogApi.getPost(id);
      mounted.current && setPost(data);
    } catch (err) {
      console.error(err);
    }
  }, [id, mounted]);

  useEffect(() => {
    getPost();
  }, [getPost]);

  const purifiedContent = DOMPurify.sanitize(marked(isEmpty(post?.content) ? '' : post?.content)) ?? '';

  return !post ? null : (
    <>
      <Box
        style={{
          backgroundColor: 'background.paper',
          minHeight: '100%'
        }}
      >
        <div>
          <Container maxWidth='lg'>
            <BlogToolbar
              title='Post Details'
              subtitle='View additional information'
              showGreeting={false}
              buttons={[
                {
                  label: 'Back',
                  startIcon: <Icons.ArrowBack fontSize='small' />,
                  onClick: handleChangeRoute('/blog', { blogLayout: 'list' })
                },
                {
                  label: 'Edit this post',
                  startIcon: <PencilAltIcon fontSize='small' />,
                  onClick: handleChangeRoute('/blog', { blogLayout: 'edit', values: post })
                }
              ]}
            />
          </Container>
        </div>
        <Divider />
        <Box py={3}>
          <Container maxWidth='md'>
            <Box
              style={{
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Chip label={post.category} variant='outlined' />
            </Box>
            <Typography
              align='center'
              color='textPrimary'
              style={{
                fontWeight: 'bold',
                marginTop: 24
              }}
              variant='h2'
            >
              {post.title}
            </Typography>
            {!isEmpty(post.shortDescription) && (
              <Typography align='center' color='textSecondary' style={{ marginTop: 24 }} variant='subtitle1'>
                {post.shortDescription}
              </Typography>
            )}
            <Box
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 24
              }}
            >
              <Box
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  marginTop: 16
                }}
              >
                <Grid container>
                  {!isEmpty(post.authorName) && (
                    <Grid item xs={12}>
                      <Typography align='center' color='textPrimary' variant='subtitle2'>
                        {post.authorName}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Typography align='center' color='textSecondary' variant='body2'>
                      {`${format(post.publishedAt, 'dd MMM')} · ${post.readTime} read`}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Container>
        </Box>
        {post.cover && (
          <Box mt={2} onClick={handleChangeRoute('/blog', { blogLayout: 'edit', values: post })}>
            <Container maxWidth='lg'>
              <Box
                style={{
                  backgroundImage: `url(${post.cover})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  borderRadius: '20px',
                  height: 600
                }}
              />
            </Container>
          </Box>
        )}
        <Box py={3}>
          <Container maxWidth='md'>
            <div className={classes.wrapper}>
              <article dangerouslySetInnerHTML={{ __html: purifiedContent }}></article>
            </div>
          </Container>
        </Box>
        <div>
          <Container maxWidth='lg'>
            <Typography color='textPrimary' variant='h6'>
              {`Comments (${comments.length})`}
            </Typography>
            <Box mt={3}>
              {comments.map(comment => (
                <BlogPostComment key={comment.id} {...comment} />
              ))}
            </Box>
          </Container>
        </div>
      </Box>
    </>
  );
};

export default BlogPostDetails;
