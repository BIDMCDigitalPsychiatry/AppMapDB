import * as React from 'react';
import BlogPostList from '../../pages/Blog/BlogPostList';
import BlogPostDetails from '../../pages/Blog/BlogPostDetails';
import BlogPostCreate from '../../pages/Blog/BlogPostCreate';
import { useRouteState } from '../../layout/store';
import BlogPostEdit from '../../pages/Blog/BlogPostEdit';
import { Box } from '@material-ui/core';
import BlogCalendar from '../../pages/Blog/BlogCalendar';

const components = {
  create: BlogPostCreate,
  edit: BlogPostEdit,
  view: BlogPostDetails,
  list: BlogPostList,
  calendar: BlogCalendar
};

const BlogLayout = () => {
  const [{ blogLayout = 'list', ...other } = {}] = useRouteState();
  const BlogComponent = components[blogLayout]; 

  return (
    <Box pt={3}>
      <BlogComponent {...other} />
    </Box>
  );
};

export default BlogLayout;
