import React from 'react';
import { Box, Button, Container, Divider, Grid, IconButton, InputAdornment, TextField } from '@material-ui/core';
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

const sortOptions = {
  desc: { label: 'Newest', SortOptionIcon: SortDescendingIcon },
  asc: { label: 'Older', SortOptionIcon: SortAscendingIcon }
};

const BlogPostList = () => {
  const mounted = useMounted();
  const sortRef = React.useRef<HTMLButtonElement | null>(null);
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [sortOption, setSortOption] = React.useState<string>(Object.keys(sortOptions)[0]);
  const [search, setSearch] = React.useState('');

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

  const { label, SortOptionIcon } = sortOptions[sortOption];

  const values = useDefaultValues();

  return (
    <>
      <Box minHeight='100%'>
        <div>
          <Container maxWidth='lg'>
            <BlogToolbar
              title='Community'
              subtitle='Keep up to date with the latest news and community resources.'
              buttons={[
                {
                  label: 'Add new post',
                  onClick: handleChangeRoute('/blog', { blogLayout: 'create', values }),
                  startIcon: <PlusIcon fontSize='small' />
                }
              ]}
            />
          </Container>
        </div>
        <Divider />
        <Box py={6}>
          <Container maxWidth='lg'>
            <Box
              style={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
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
            </Box>
            <Box mt={6}>
              <Grid container spacing={6}>
                {sortPosts(searchPosts(posts, search), sortOption).map(post => (
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
                ))}
              </Grid>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default BlogPostList;
