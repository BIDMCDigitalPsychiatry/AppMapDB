import * as React from 'react';
import { Box, Card, CardContent, CardMedia, Chip, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { bool, formatWithDefault, isEmpty, lineClamp, publicUrl, stripContent } from '../../../../helpers';
import { useChangeRoute } from '../../../layout/hooks';
import { useCommentsByPostId } from '../../../../database/useComments';
import { getObjectUrl } from '../../../../aws-exports';

const height = 400;
const useStyles = makeStyles((theme: any) =>
  createStyles({
    root: {
      flex: '1',
      textAlign: 'left',
      height,
      display: 'flex',
      flexDirection: 'column',
      transition: 'box-shadow 0.15s ease-in-out, transform 0.15s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(16, 24, 40, 0.12)'
      },
      cursor: 'pointer'
    },
    rootDisabled: {
      flex: '1',
      textAlign: 'left',
      height
    },
    media: {
      height: 176,
      width: '100%',
      objectFit: 'cover',
      borderBottom: `1px solid ${theme.palette.divider ?? '#E5EAF0'}`,
      backgroundColor: theme.palette.grey[100],
      flexShrink: 0
    },
    title: {
      '& h1, & h2, & h3, & p': {
        margin: 0,
        fontSize: '1rem',
        fontWeight: 700,
        lineHeight: 1.35
      }
    },
    description: {
      color: theme.palette.text.secondary,
      '& p': {
        margin: 0,
        fontSize: theme.typography.body2.fontSize,
        lineHeight: theme.typography.body2.lineHeight
      }
    },
    archived: {
      color: theme.palette.error.main,
      borderColor: theme.palette.error.main
    },
    adminOnly: {
      color: theme.palette.primary.main,
      borderColor: theme.palette.primary.main
    }
  })
);

export default function NewsForumGridItem({
  _id,
  title,
  subTitle,
  shortDescription,
  created,
  updated,
  children = undefined,
  authorName,
  category,
  adminOnly = undefined,
  cover = '/images/covers/cover_default.jpg', // set default cover
  publishedAt,
  readTime,
  deleted = undefined,
  ...other
}) {
  const classes = useStyles({});
  const changeRoute = useChangeRoute();

  const handleClick = React.useCallback(() => {
    changeRoute(publicUrl('/Community'), prev => ({ ...prev, subRoute: 'view', _id })); // Keep previous category for back button
  }, [changeRoute, _id]);

  const { data: comments } = useCommentsByPostId({ postId: _id });
  const filtered = (comments || []).filter(e => !e.deleted);

  const meta = [
    authorName ? 'Registered User' : 'Unknown Author',
    formatWithDefault(publishedAt, 'dd MMM', 'Unknown Date'),
    `${readTime} read`,
    filtered.length > 0 && `${filtered.length} comment${filtered.length === 1 ? '' : 's'}`
  ]
    .filter(t => t)
    .join(' · ');

  return children ? (
    <Card className={classes.rootDisabled}>
      <CardContent>{children}</CardContent>
    </Card>
  ) : (
    <Card onClick={handleClick} className={classes.root} elevation={0}>
      <CardMedia
        className={classes.media}
        image={isEmpty(cover) ? '/images/avatars/empty-profile.png' : cover.startsWith('data:') ? cover : getObjectUrl(cover)}
        component='img'
        alt=''
      />
      <CardContent sx={{ p: 2, pt: 1.5, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Chip label={category} size='small' variant='outlined' />
          {bool(adminOnly) && <Chip label='Admin Only' size='small' variant='outlined' className={classes.adminOnly} />}
          {bool(deleted) && <Chip label='Archived' size='small' variant='outlined' className={classes.archived} />}
        </Box>
        <Box sx={{ mt: 1.25 }}>
          <div className={classes.title} dangerouslySetInnerHTML={{ __html: lineClamp(stripContent(title || 'Unknown Name'), 2) }} />
        </Box>
        <Box sx={{ mt: 0.75, flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div className={classes.description} dangerouslySetInnerHTML={{ __html: lineClamp(stripContent(shortDescription), 3) }} />
        </Box>
        <Typography variant='caption' color='textSecondary' noWrap sx={{ pt: 1 }}>
          {meta}
        </Typography>
      </CardContent>
    </Card>
  );
}
