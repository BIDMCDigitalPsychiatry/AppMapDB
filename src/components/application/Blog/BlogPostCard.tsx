import type { FC } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Box, CardMedia, Chip, Grid, Link, Typography } from '@material-ui/core';
import { useHandleChangeRoute } from '../../layout/hooks';
import { isEmpty } from '../../../helpers';
import { grey } from '@material-ui/core/colors';

interface BlogPostCardProps {
  id: string;
  authorName: string;
  category: string;
  cover: string;
  publishedAt: number;
  readTime: string;
  shortDescription: string;
  title: string;
}

const BlogPostCard: FC<BlogPostCardProps> = props => {
  const { id, authorName, category, cover, publishedAt, readTime, shortDescription, title, ...other } = props;
  const handleChangeRoute = useHandleChangeRoute();

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
            onClick={handleChangeRoute('/blog', { blogLayout: 'view', id })}
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
            onClick={handleChangeRoute('/blog', { blogLayout: 'view', id })}
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
        <div>
          <Chip label={category} variant='outlined' />
        </div>
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
                {`${format(publishedAt, 'dd MMM')} · ${readTime} read`}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        <Link color='textPrimary' onClick={handleChangeRoute('/blog', { blogLayout: 'view', id })} variant='h5'>
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
