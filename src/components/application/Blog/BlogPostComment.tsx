import { formatDistanceToNow } from 'date-fns';
import { Box, Grid, Paper, Typography } from '@material-ui/core';
import DialogButton, { EditDialogButton } from '../GenericDialog/DialogButton';
import * as CommentDialog from '../GenericDialog/Comment';
import { useIsAdmin } from '../../../hooks';
import { useUserEmail, useUserId } from '../../layout/hooks';
import { isEmpty } from '../../../helpers';
import { sortComments } from '../../pages/Blog/helpers';
import { useCommentsByParentId } from '../../../database/useComments';

const BlogPostComment = ({ mountDialog = true, sortOption, onRefresh = undefined, ...props }) => {
  const { _id, parentId, authorName, content, createdAt, createdBy } = props;

  const isAdmin = useIsAdmin();
  const userId = useUserId();
  const signedIn = useIsAdmin();

  const canEdit = isAdmin || (!isEmpty(userId) && userId === createdBy); // Admin and owner can edit
  const userEmail = useUserEmail();

  const { data: comments, handleRefresh } = useCommentsByParentId({ parentId: _id });

  const filtered = sortComments(
    comments.filter(e => !e.deleted),
    sortOption
  );

  console.log({ parentId, props });

  return (
    <>
      <Box
        style={{
          display: 'flex',
          paddingBottom: 24
        }}
      >
        <Paper
          style={{
            marginLeft: 24,
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 12,
            paddingBottom: 12,
            width: '100%'
          }}
          variant='outlined'
        >
          <Grid container justify='space-between' spacing={1}>
            <Grid item xs>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography color='textPrimary' variant='subtitle2'>
                    {authorName}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography color='textPrimary' variant='body2'>
                    {content}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container justify='flex-end' alignContent='flex-end' alignItems='flex-end' spacing={1}>
                <Grid item xs={12} style={{ textAlign: 'right' }}>
                  <Typography align='right' color='textSecondary' variant='caption'>
                    {isEmpty(parentId) ? 'Commented ' : 'Replied '}
                    {formatDistanceToNow(createdAt, { addSuffix: true })}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2} justify='flex-end'>
                    {canEdit && (
                      <Grid item>
                        <EditDialogButton Module={CommentDialog} mount={mountDialog} initialValues={props} tooltip='' variant='link' onClose={onRefresh}>
                          Edit
                        </EditDialogButton>
                      </Grid>
                    )}
                    {signedIn && (
                      <Grid item>
                        <DialogButton
                          Module={CommentDialog}
                          onClose={onRefresh}
                          tooltip=''
                          initialValues={{ authorName: isEmpty(userEmail) ? 'Anonymous' : userEmail, postId: props.postId, parentId: props._id }}
                          variant='link'
                          mount={canEdit ? false : mountDialog}
                        >
                          Reply
                        </DialogButton>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      {filtered.map(comment => (
        <BlogPostComment key={comment.id} {...comment} sortOption={sortOption} onRefresh={handleRefresh} mountDialog={false} />
      ))}
    </>
  );
};

export default BlogPostComment;
