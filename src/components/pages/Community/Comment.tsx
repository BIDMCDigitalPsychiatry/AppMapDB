import { formatDistanceToNow } from 'date-fns';
import fr from 'date-fns/locale/fr';
import de from 'date-fns/locale/de';
import { Box, Grid, Paper, Typography } from '@mui/material';
import DialogButton, { EditDialogButton } from '../../application/GenericDialog/DialogButton';
import * as CommentDialog from '../../application/GenericDialog/Comment';
import { useIsAdmin } from '../../../hooks';
import { useUserEmail, useUserId } from '../../layout/hooks';
import { isEmpty } from '../../../helpers';
import { sortComments } from './helpers';
import { useCommentsByParentId } from '../../../database/useComments';
import { useCurrentLanguage, useT } from '../../../i18n';

const DATE_FNS = { fr, de };

const Comment = ({ mountDialog = true, sortOption, onRefresh = undefined, level = 0, ...props }) => {
  const { _id, parentId, authorName, content, createdAt, createdBy } = props;

  const t = useT();
  const lang = useCurrentLanguage();
  const isAdmin = useIsAdmin();
  const userId = useUserId();
  const signedIn = useIsAdmin();

  const canEdit = isAdmin || (!isEmpty(userId) && userId === createdBy); // Admin and owner can edit
  const userEmail = useUserEmail();

  const { data: comments, handleRefresh } = useCommentsByParentId({ parentId: _id });

  const filtered = sortComments(
    (comments || []).filter(e => !e.deleted),
    sortOption
  );

  return (
    <>
      <Box
        style={{
          display: 'flex',
          paddingBottom: 24,
          paddingLeft: Math.min(level * 32, 128)
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
          <Grid container justifyContent='space-between' spacing={1}>
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
              <Grid container justifyContent='flex-end' alignContent='flex-end' alignItems='flex-end' spacing={1}>
                <Grid item xs={12} style={{ textAlign: 'right' }}>
                  <Typography align='right' color='textSecondary' variant='caption'>
                    {isEmpty(parentId)
                      ? t('Commented {{time}}', { time: formatDistanceToNow(createdAt, { addSuffix: true, locale: DATE_FNS[lang] }) })
                      : t('Replied {{time}}', { time: formatDistanceToNow(createdAt, { addSuffix: true, locale: DATE_FNS[lang] }) })}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2} justifyContent='flex-end'>
                    {canEdit && (
                      <Grid item>
                        <EditDialogButton Module={CommentDialog} mount={mountDialog} initialValues={props} tooltip='' variant='link' onClose={onRefresh}>
                          {t('Edit')}
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
                          {t('Reply')}
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
        <Comment key={comment.id} {...comment} sortOption={sortOption} onRefresh={handleRefresh} mountDialog={false} level={level + 1} />
      ))}
    </>
  );
};

export default Comment;
