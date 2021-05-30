import React from 'react';
import { Box, Button, Container, createStyles, Grid, IconButton, InputAdornment, makeStyles, TextField, Typography } from '@material-ui/core';
import { blogApi } from '../../../__fakeApi__/blogApi';
import PlusIcon from '../../icons/Plus';
import SortAscendingIcon from '../../icons/SortAscending';
import SortDescendingIcon from '../../icons/SortDescending';
import SearchIcon from '../../icons/Search';
import useMounted from '../../hooks/useMounted';
import { Post, useDefaultValues } from '../../application/Blog/post';
import BlogPostCard from '../../application/Blog/BlogPostCard';
import { useHandleChangeRoute } from '../../layout/hooks';
import BlogToolbar from './BlogToolbar';
import * as Icons from '@material-ui/icons';
import { searchPosts, sortPosts } from './helpers';
import { useIsAdmin } from '../../../hooks';

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
  const mounted = useMounted();
  const sortRef = React.useRef<HTMLButtonElement | null>(null);
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [sortOption, setSortOption] = React.useState<string>(Object.keys(sortOptions)[0]);
  const [search, setSearch] = React.useState('');
  const [showArchived, setShowArchived] = React.useState(false);
  const isAdmin = useIsAdmin();

  const handleSearch = React.useCallback(event => setSearch(event?.target?.value), [setSearch]);
  const handleClearSearch = React.useCallback(() => setSearch(''), [setSearch]);

  const handleChangeRoute = useHandleChangeRoute();

  const getPosts = React.useCallback(async () => {
    try {
      const data = await blogApi.getPosts();

      if (mounted.current) {
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [mounted]);

  React.useEffect(() => {
    getPosts();
  }, [getPosts]);

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
      posts.filter(p => p.category === category && (showArchived ? p.deleted : !p.deleted)),
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
                <Grid item key={post.id} lg={4} md={6} xs={12}>
                  <BlogPostCard
                    id={post.id}
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
