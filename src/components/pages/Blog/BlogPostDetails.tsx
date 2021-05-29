import React from 'react';
import { format, subHours } from 'date-fns';
import { Box, Chip, Container, createStyles, Divider, Grid, makeStyles, Typography } from '@material-ui/core';
import PencilAltIcon from '../../icons/PencilAlt';
import BlogPostComment from '../../application/Blog/BlogPostComment';
import { useHandleChangeRoute } from '../../layout/hooks';
import { useRouteState } from '../../layout/store';
import BlogToolbar from './BlogToolbar';
import marked from 'marked';
import DOMPurify from 'dompurify';
import { isEmpty } from '../../../helpers';
import * as Icons from '@material-ui/icons';
import useValues from './useValues';
import { useIsAdmin } from '../../../hooks';

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
    deleteButton: {
      color: theme.palette.error.main,
      borderColor: theme.palette.error.main,
      '&:hover': {
        borderColor: theme.palette.error.main
      }
    },
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

const BlogPostDetails = () => {
  const classes = useStyles();
  const isAdmin = useIsAdmin();

  const handleChangeRoute = useHandleChangeRoute();
  const [{ id }] = useRouteState();

  const { values, handleDelete } = useValues({ type: 'view', values: { id } });

  const purifiedContent = DOMPurify.sanitize(marked(isEmpty(values?.content) ? '' : values?.content)) ?? '';

  return !values ? null : (
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
                isAdmin &&
                  values?.deleted && {
                    label: 'Restore this post',
                    startIcon: <Icons.RestoreFromTrash fontSize='small' />,
                    onClick: () => {
                      handleDelete({ deleted: false, onSuccess: handleChangeRoute('/blog', { blogLayout: 'list' }) });
                    }
                  },
                isAdmin &&
                  !values?.deleted && {
                    label: 'Archive this post',
                    startIcon: <Icons.Delete fontSize='small' />,
                    onClick: () => {
                      handleDelete({ onSuccess: handleChangeRoute('/blog', { blogLayout: 'list' }) });
                    },
                    className: classes.deleteButton
                  },
                !values?.deleted && {
                  label: 'Edit this post',
                  startIcon: <PencilAltIcon fontSize='small' />,
                  onClick: handleChangeRoute('/blog', { blogLayout: 'edit', values })
                }
              ].filter(b => b)}
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
              <Chip label={values.category} variant='outlined' />
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
              {values.title}
            </Typography>
            {!isEmpty(values.shortDescription) && (
              <Typography align='center' color='textSecondary' style={{ marginTop: 24 }} variant='subtitle1'>
                {values.shortDescription}
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
                  {!isEmpty(values.authorName) && (
                    <Grid item xs={12}>
                      <Typography align='center' color='textPrimary' variant='subtitle2'>
                        {values.authorName}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Typography align='center' color='textSecondary' variant='body2'>
                      {`${values?.publishedAt ? format(values?.publishedAt, 'dd MMM') : ''} · ${values.readTime} read`}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Container>
        </Box>
        {values.cover && (
          <Box mt={2} onClick={handleChangeRoute('/blog', { blogLayout: 'edit', values })}>
            <Container maxWidth='lg'>
              <Box
                style={{
                  backgroundImage: `url(${values.cover})`,
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
