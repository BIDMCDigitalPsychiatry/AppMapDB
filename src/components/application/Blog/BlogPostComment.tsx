import { formatDistanceToNow } from 'date-fns';
import { Box, Grid, Paper, Typography } from '@material-ui/core';
import { EditDialogButton } from '../GenericDialog/DialogButton';
import * as CommentDialog from '../GenericDialog/Comment';
import { useIsAdmin } from '../../../hooks';
import { useUserId } from '../../layout/hooks';
import { isEmpty } from '../../../helpers';

const BlogPostComment = ({ handleRefresh, ...props }) => {
  const { authorName, content, createdAt, createdBy } = props;

  const isAdmin = useIsAdmin();
  const userId = useUserId();

  const canEdit = isAdmin || (!isEmpty(userId) && userId === createdBy); // Admin and owner can edit

  return (
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
                  {formatDistanceToNow(createdAt, { addSuffix: true })}
                </Typography>
              </Grid>
              {canEdit && (
                <Grid item xs={12} style={{ textAlign: 'right' }}>
                  <EditDialogButton Module={CommentDialog} initialValues={props} tooltip='' variant='link'>
                    Edit
                  </EditDialogButton>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default BlogPostComment;
