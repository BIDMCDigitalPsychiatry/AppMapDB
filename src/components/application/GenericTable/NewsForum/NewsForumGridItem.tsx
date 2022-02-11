import * as React from 'react';
import { Box, Card, CardContent, CardMedia, Chip, Divider, Grid, Link, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { bool, formatWithDefault, isEmpty, lineClamp, publicUrl, stripContent } from '../../../../helpers';
import { useChangeRoute } from '../../../layout/hooks';
import { useCommentsByPostId } from '../../../../database/useComments';

const height = 448;
const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      flex: '1',
      textAlign: 'center',
      height,
      borderRadius: 10,
      transition: 'transform 0.15s ease-in-out',
      '&:hover': {
        transform: 'scale3d(1.025, 1.025, 1)'
      },
      cursor: 'pointer'
    },
    rootDisabled: {
      flex: '1',
      textAlign: 'center',
      height,
      borderRadius: 10
    },
    cardContent: {
      paddingTop: 8,
      paddingBottom: 0
    },
    media: {
      height: 200,
      width: '100%',
      padding: 8,
      borderBottom: `1px solid ${theme.palette.grey[400]}`
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
  const [state, setState] = React.useState({
    raised: false
  });

  const classes = useStyles({});
  const changeRoute = useChangeRoute();

  const handleClick = React.useCallback(() => {
    changeRoute(publicUrl('/Community'), prev => ({ ...prev, subRoute: 'view', _id })); // Keep previous category for back button
  }, [changeRoute, _id]);

  const { data: comments } = useCommentsByPostId({ postId: _id });
  const filtered = comments.filter(e => !e.deleted);

  return children ? (
    <Card className={classes.root}>
      <CardContent className={classes.cardContent}>{children}</CardContent>
    </Card>
  ) : (
    <Card
      onClick={handleClick}
      className={classes.root}
      onMouseOver={() => setState({ raised: true })}
      onMouseOut={() => setState({ raised: false })}
      raised={state.raised}
      elevation={state.raised ? 8 : 4}
    >
      <CardMedia className={classes.media} image={isEmpty(cover) ? '/images/avatars/empty-profile.png' : cover} component='img' />
      <CardContent className={classes.cardContent}>
        <Box mt={1} mb={2}>
          <Grid container justifyContent='center' spacing={1}>
            <Grid item>
              <Chip label={category} variant='outlined' />
            </Grid>
            {bool(adminOnly) && (
              <Grid item>
                <Chip label='Admin Only' variant='outlined' className={classes.adminOnly} />
              </Grid>
            )}
            {bool(deleted) && (
              <Grid item>
                <Chip label='Archived' variant='outlined' className={classes.archived} />
              </Grid>
            )}
          </Grid>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center'
            }}
            mt={1}
          >
            <Grid container>
              <Grid item xs={12}>
                <Typography color='textPrimary' variant='subtitle2' align='center'>
                  {authorName || 'Unknown Author'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Grid container justifyContent='center' spacing={1}>
                  {[
                    `${formatWithDefault(publishedAt, 'dd MMM', 'Unknown Date')}`,
                    `·`,
                    `${readTime} read`,
                    filtered.length > 0 && `·`,
                    filtered.length > 0 && `${filtered.length} comments`
                  ]
                    .filter(t => t)
                    .map((t, i) => (
                      <Grid item key={i}>
                        <Typography display='block' color='textSecondary' variant='caption' align='center'>
                          {t}
                        </Typography>
                      </Grid>
                    ))}
                </Grid>
              </Grid>
            </Grid>
          </Box>
          <Box mt={1} mb={-1}>
            <Divider />
          </Box>
          <Box height={64}>
            <Link color='textPrimary' onClick={handleClick}>
              <Typography
                variant='h6'
                align='left'
                dangerouslySetInnerHTML={{ __html: lineClamp(stripContent(title || 'Unknown Name'), isEmpty(shortDescription?.trim()) ? 4 : 2) }}
              />
            </Link>
          </Box>
          <Typography variant='caption' align='left' dangerouslySetInnerHTML={{ __html: lineClamp(stripContent(shortDescription), 3) }} />
        </Box>
      </CardContent>
    </Card>
  );
}
