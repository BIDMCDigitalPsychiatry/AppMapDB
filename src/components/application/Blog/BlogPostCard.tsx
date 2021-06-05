import React from 'react';
import PropTypes from 'prop-types';
import { Box, CardMedia, Chip, createStyles, Grid, Link, makeStyles, Typography } from '@material-ui/core';
import { useChangeRoute } from '../../layout/hooks';
import { bool, isEmpty, formatWithDefault } from '../../../helpers';
import { grey } from '@material-ui/core/colors';

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    archived: {
      color: palette.error.main,
      borderColor: palette.error.main
    },
    adminOnly: {
      color: palette.primary.main,
      borderColor: palette.primary.main
    }
  })
);

const BlogPostCard = ({
  _id,
  authorName,
  category,
  adminOnly = undefined,
  cover = '/images/covers/cover_default.jpg', // set default cover
  publishedAt,
  readTime,
  shortDescription,
  title,
  deleted = undefined,
  ...other
}) => {
  const classes = useStyles({});
  const changeRoute = useChangeRoute();

  const handleClick = React.useCallback(() => {
    changeRoute('/blog', prev => ({ ...prev, blogLayout: 'view', _id })); // Keep previous category for back button
  }, [changeRoute, _id]);

  return (
    <div {...other}>
      <div
        style={{
          paddingTop: 'calc(100% * 4 / 4)',
          position: 'relative'
        }}
      >
        {cover ? (
          <CardMedia
            onClick={handleClick}
            image={cover}
            style={{
              height: '100%',
              position: 'absolute',
              top: 0,
              width: '100%'
            }}
          />
        ) : (
          <div
            onClick={handleClick}
            style={{
              padding: 24,
              height: '100%',
              position: 'absolute',
              top: 0,
              width: '100%',
              background: grey[100]
            }}
          >
            <Typography color='textSecondary' align='center' variant='h6' noWrap>
              {title}
            </Typography>
          </div>
        )}
      </div>
      <Box mt={2}>
        <Grid container spacing={1}>
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
            alignItems: 'center',
            marginTop: 16,
            marginBottom: 16
          }}
        >
          <Grid container>
            {!isEmpty(authorName) && (
              <Grid item xs={12}>
                <Typography color='textPrimary' variant='subtitle2'>
                  {authorName}
                </Typography>
              </Grid>
            )}
            <Grid item>
              <Typography color='textSecondary' variant='caption'>
                {`${formatWithDefault(publishedAt, 'dd MMM', 'Unknown Date')} · ${readTime} read`}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        <Link color='textPrimary' onClick={handleClick} variant='h5'>
          {title}
        </Link>
        <Typography
          color='textSecondary'
          style={{
            height: 72,
            marginTop: 8,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2
          }}
          variant='body1'
        >
          {shortDescription}
        </Typography>
      </Box>
    </div>
  );
};

BlogPostCard.propTypes = {
  authorName: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  cover: PropTypes.string.isRequired,
  publishedAt: PropTypes.number.isRequired,
  readTime: PropTypes.string.isRequired,
  shortDescription: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

export default BlogPostCard;
