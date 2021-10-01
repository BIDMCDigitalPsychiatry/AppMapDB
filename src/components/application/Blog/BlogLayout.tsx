import * as React from 'react';
import BlogPostList from '../../pages/Blog/BlogPostList';
import BlogPostDetails from '../../pages/Blog/BlogPostDetails';
import BlogPostCreate from '../../pages/Blog/BlogPostCreate';
import { useRouteState } from '../../layout/store';
import BlogPostEdit from '../../pages/Blog/BlogPostEdit';
import { Box, Divider } from '@material-ui/core';
import BlogCalendar from '../../pages/Blog/BlogCalendar';
import BlogLayoutSelector from './BlogLayoutSelector';

const components = {
  create: BlogPostCreate,
  edit: BlogPostEdit,
  view: BlogPostDetails,
  list: BlogPostList,
  calendar: BlogCalendar
};

const BlogLayout = () => {
  const [{ subRoute = 'list', category = 'News', ...other } = {}] = useRouteState();
  const BlogComponent = components[subRoute];

  return (
    <Box pt={3}>
      <BlogLayoutSelector category={category} />
      <Divider style={{ marginTop: 16 }} />
      <BlogComponent category={category} {...other} />
    </Box>
  );
};

export default BlogLayout;
