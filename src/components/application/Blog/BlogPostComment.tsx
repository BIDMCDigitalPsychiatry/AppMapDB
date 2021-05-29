import type { FC } from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';
import { Box, Paper, Typography } from '@material-ui/core';

interface BlogPostCommentProps {
  authorName: string;
  content: string;
  createdAt: number;
}

const BlogPostComment: FC<BlogPostCommentProps> = props => {
  const { authorName, content, createdAt, ...other } = props;

  return (
    <Box
      style={{
        display: 'flex',
        paddingBottom: 24
      }}
      {...other}
    >
      <Paper
        style={{
          marginLeft: 24,
          paddingLeft: 12,
          paddingRight: 36,
          paddingTop: 12,
          paddingBottom: 12,
          width: '100%'
        }}
        variant='outlined'
      >
        <Box
          style={{
            alignItems: 'flex-start',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <Typography color='textPrimary' variant='subtitle2'>
              {authorName}
            </Typography>
          </div>
          <Typography color='textSecondary' variant='caption'>
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </Typography>
        </Box>
        <Typography color='textPrimary' variant='body2'>
          {content}
        </Typography>
      </Paper>
    </Box>
  );
};

BlogPostComment.propTypes = {
  authorName: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  createdAt: PropTypes.number.isRequired
};

export default BlogPostComment;
