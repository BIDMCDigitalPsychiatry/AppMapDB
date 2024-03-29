import React from 'react';
import { format } from 'date-fns';
import { Box, Button, Chip, Container, Divider, Grid, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import PencilAltIcon from '../../icons/PencilAlt';
import Comment from './Comment';
import { useChangeRoute, useUserEmail } from '../../layout/hooks';
import { useRouteState } from '../../layout/store';
import CommunityToolbar from './CommunityToolbar';
import marked from 'marked';
import DOMPurify from 'dompurify';
import { bool, isEmpty, isEmptyObject, publicUrl } from '../../../helpers';
import * as Icons from '@mui/icons-material';
import useValues from './useValues';
import { useIsAdmin } from '../../../hooks';
import DialogButton from '../../application/GenericDialog/DialogButton';
import * as CommentDialog from '../../application/GenericDialog/Comment';
import { useCommentsByPostId } from '../../../database/useComments';
import { sortComments } from './helpers';
import useSortOptions from '../../../utils/useSortOptions';
import { getObjectUrl } from '../../../aws-exports';

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

const Details = () => {
  const classes = useStyles();
  const isAdmin = useIsAdmin();
  const changeRoute = useChangeRoute();

  const userEmail = useUserEmail();

  const [{ _id }] = useRouteState();
  const { values = {}, handleDelete } = useValues({ type: 'view', values: { _id } });

  const { enableComments } = values;

  const handleBack = React.useCallback(() => {
    changeRoute(publicUrl('/Community'), prev => ({ ...prev, subRoute: 'list' }));
  }, [changeRoute]);

  const handleEdit = React.useCallback(() => {
    changeRoute(publicUrl('/Community'), prev => ({ ...prev, subRoute: 'edit', values }));
    // eslint-disable-next-line
  }, [changeRoute, JSON.stringify(values)]);

  const purifiedContent = DOMPurify.sanitize(marked(isEmpty(values?.content) ? '' : values?.content)) ?? '';

  const { data: comments, handleRefresh } = useCommentsByPostId({ postId: _id });

  const { sortOption, handleToggleSortDirection, sortLabel, SortOptionIcon } = useSortOptions();

  const commentCount = comments.filter(e => !e.deleted).length;

  const filtered = sortComments(
    comments.filter(e => !e.deleted && isEmpty(e.parentId)),
    sortOption
  );

  return !values ? null : (
    <>
      <Container maxWidth='lg'>
        <CommunityToolbar
          title='Post Details'
          subtitle='View additional information'
          showGreeting={false}
          buttons={[
            {
              label: 'Back',
              startIcon: <Icons.ArrowBack fontSize='small' />,
              onClick: handleBack
            },
            isAdmin &&
              values?.deleted && {
                label: 'Restore this post',
                startIcon: <Icons.RestoreFromTrash fontSize='small' />,
                onClick: () => {
                  handleDelete({ deleted: false, onSuccess: handleBack });
                }
              },
            isAdmin &&
              !values?.deleted && {
                label: 'Archive this post',
                startIcon: <Icons.Delete fontSize='small' />,
                onClick: () => {
                  handleDelete({ onSuccess: handleBack });
                },
                className: classes.deleteButton
              },
            isAdmin && {
              label: 'Edit this post',
              startIcon: <PencilAltIcon fontSize='small' />,
              onClick: handleEdit
            }
          ].filter(b => b)}
        />
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
                      {`${!isEmptyObject(values?.publishedAt) ? format(values?.publishedAt, 'dd MMM') : ''} · ${values.readTime} read`}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Container>
        </Box>
        {values.cover && (
          <Box mt={0}>
            <Container maxWidth='xl'>
              <Grid container justifyContent='center'>
                <Grid item>
                  <img
                    alt='cover'
                    src={isEmpty(values?.cover) ? '' : values?.cover?.startsWith('data:') ? values.cover : getObjectUrl(values.cover)}
                    style={{ maxHeight: 350 }}
                  />
                </Grid>
              </Grid>
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
        {bool(enableComments) && (
          <div>
            <Container maxWidth='lg'>
              <Grid container justifyContent='space-between' spacing={2}>
                <Grid item>
                  <Typography color='textPrimary' variant='h6'>
                    {`Comments (${commentCount})`}
                  </Typography>
                </Grid>

                <Grid item>
                  <Grid container spacing={1}>
                    <Grid item>
                      <Button color='primary' onClick={handleToggleSortDirection} size='small' startIcon={<SortOptionIcon fontSize='small' />} variant='text'>
                        {sortLabel}
                      </Button>
                    </Grid>

                    <Grid item>
                      <DialogButton
                        Module={CommentDialog}
                        onClose={handleRefresh}
                        initialValues={{ authorName: isEmpty(userEmail) ? 'Anonymous' : userEmail, postId: _id }}
                        variant='default'
                      >
                        Add Comment
                      </DialogButton>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Box mt={3}>
                {filtered.length === 0 ? (
                  <Typography color='textSecondary'>There are no comments</Typography>
                ) : (
                  filtered.map((comment, i) => (
                    <Comment key={comment.id} {...comment} sortOption={sortOption} onRefresh={handleRefresh} mountDialog={i === 0} />
                  ))
                )}
              </Box>
            </Container>
          </div>
        )}
      </Container>
    </>
  );
};

export default Details;
