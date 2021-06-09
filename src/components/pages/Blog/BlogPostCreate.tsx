import React from 'react';
import { Box, Container, Divider } from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import BlogPostCreateForm from '../../application/Blog/BlogPostCreateForm';
import { useHandleChangeRoute } from '../../layout/hooks';
import BlogToolbar from './BlogToolbar';
import useValues from './useValues';
import { useRouteState } from '../../layout/store';

const BlogPostCreate = () => {
  const handleChangeRoute = useHandleChangeRoute();
  const [{ category }] = useRouteState(); // Get initial category
  const { values, setValues, errors, handleSave } = useValues({ type: 'create', category });

  return (
    <Container maxWidth='lg'>
      <BlogToolbar
        title='Create Post'
        showGreeting={true}
        buttons={[
          {
            label: 'Cancel',
            onClick: handleChangeRoute('/connect', prev => ({ ...prev, blogLayout: 'list' })),
            color: 'secondary'
          },
          {
            label: 'Publish Changes',
            startIcon: <Icons.Save />,
            onClick: handleSave,
            variant: 'contained'
          }
        ]}
      />

      <Divider />
      <Box style={{ paddingTop: 48, paddingBottom: 48 }}>
        <BlogPostCreateForm values={values} setValues={setValues} errors={errors} />
      </Box>
    </Container>
  );
};

export default BlogPostCreate;
