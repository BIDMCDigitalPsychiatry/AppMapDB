import React from 'react';
import { Box, Button, Container, createStyles, Grid, IconButton, InputAdornment, makeStyles, TextField, Typography } from '@material-ui/core';
import PlusIcon from '../../icons/Plus';
import SortAscendingIcon from '../../icons/SortAscending';
import SortDescendingIcon from '../../icons/SortDescending';
import SearchIcon from '../../icons/Search';
import { useDefaultValues } from '../../application/Blog/post';
import BlogPostCard from '../../application/Blog/BlogPostCard';
import { useHandleChangeRoute } from '../../layout/hooks';
import BlogToolbar from './BlogToolbar';
import * as Icons from '@material-ui/icons';
import { searchPosts, sortPosts } from './helpers';
import { useIsAdmin } from '../../../hooks';
import { usePosts } from '../../../database/usePosts';
import { bool } from '../../../helpers';

const sortOptions = {
  desc: { label: 'Newest', SortOptionIcon: SortDescendingIcon },
  asc: { label: 'Older', SortOptionIcon: SortAscendingIcon }
};

const useStyles = makeStyles(theme =>
  createStyles({
    archiveBanner: {
      padding: 16,
      margin: 24,
      borderRadius: 12,
      color: theme.palette.common.white,
      background: theme.palette.error.main
    }
  })
);

const BlogPostList = ({ category = 'News' }) => {
  const classes = useStyles({});
  const sortRef = React.useRef<HTMLButtonElement | null>(null);
  const { posts, handleRefresh } = usePosts();

  const [sortOption, setSortOption] = React.useState<string>(Object.keys(sortOptions)[0]);
  const [search, setSearch] = React.useState('');
  const [showArchived, setShowArchived] = React.useState(false);
  const isAdmin = useIsAdmin();

  const handleSearch = React.useCallback(event => setSearch(event?.target?.value), [setSearch]);
  const handleClearSearch = React.useCallback(() => setSearch(''), [setSearch]);

  const handleChangeRoute = useHandleChangeRoute();

  React.useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleToggleSortDirection = (): void => {
    setSortOption(prev => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const handleToggleShowArchived = (): void => {
    setShowArchived(prev => !prev);
  };

  const { label, SortOptionIcon } = sortOptions[sortOption];

  const values = useDefaultValues();

  const ArchiveIcon = !showArchived ? Icons.VisibilityOff : Icons.Visibility;

  const filtered = sortPosts(
    searchPosts(
      Object.keys(posts)
        .filter(
          k => (isAdmin || (!isAdmin && !bool(posts[k]?.adminOnly))) && posts[k].category === category && (showArchived ? posts[k].deleted : !posts[k].deleted)
        )
        .map(k => posts[k]),
      search
    ),
    sortOption
  );

  return (
    <Container maxWidth='lg'>
      <BlogToolbar
        title={category}
        subtitle='Keep up to date with the latest news and community resources.'
        buttons={
          isAdmin
            ? [
                {
                  label: 'Add new post',
                  onClick: handleChangeRoute('/blog', prev => ({ ...prev, blogLayout: 'create', values })),
                  startIcon: <PlusIcon fontSize='small' />
                }
              ]
            : []
        }
      />

      <Box py={0}>
        <Grid container justify='space-between' alignItems='center'>
          <Grid item>
            <Box style={{ width: 500 }}>
              <TextField
                onChange={handleSearch}
                value={search}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon fontSize='small' />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position='start'>
                      <IconButton style={{ padding: 8, marginRight: -16 }} onClick={handleClearSearch}>
                        <Icons.Clear fontSize='small' />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                size='small'
                placeholder='Search posts'
                variant='outlined'
              />
            </Box>
          </Grid>
          <Grid item>
            <Grid container spacing={2}>
              {isAdmin && (
                <Grid item>
                  <Button
                    color='primary'
                    onClick={handleToggleShowArchived}
                    ref={sortRef}
                    size='small'
                    startIcon={<ArchiveIcon fontSize='small' />}
                    variant='text'
                  >
                    {showArchived ? 'Hide Archived' : 'Show Archived'}
                  </Button>
                </Grid>
              )}
              <Grid item>
                <Button
                  color='primary'
                  onClick={handleToggleSortDirection}
                  ref={sortRef}
                  size='small'
                  startIcon={<SortOptionIcon fontSize='small' />}
                  variant='text'
                >
                  {label}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Box mt={6}>
          <Grid container spacing={6}>
            {showArchived && (
              <Grid item xs={12} className={classes.archiveBanner}>
                <Typography variant='h6' style={{ color: 'white' }}>
                  {`Viewing Archived Posts`}
                </Typography>
              </Grid>
            )}
            {filtered.length === 0 ? (
              <Box m={3}>
                <Typography variant='h6' color='textSecondary' align='center'>
                  {`There are no ${showArchived ? 'archived posts' : 'posts'} to view at this time.`}
                </Typography>
              </Box>
            ) : (
              filtered.map(post => (
                <Grid item key={post._id} lg={4} md={6} xs={12}>
                  <BlogPostCard
                    _id={post._id}
                    authorName={post.authorName}
                    category={post.category}
                    cover={post.cover}
                    publishedAt={post.publishedAt}
                    readTime={post.readTime}
                    shortDescription={post.shortDescription}
                    title={post.title}
                  />
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default BlogPostList;
