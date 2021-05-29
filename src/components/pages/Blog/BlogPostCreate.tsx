import React from 'react';
import { Box, Container, Divider } from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import BlogPostCreateForm from '../../application/Blog/BlogPostCreateForm';
import { useHandleChangeRoute } from '../../layout/hooks';
import BlogToolbar from './BlogToolbar';
import useValues from './useValues';

const BlogPostCreate = () => {
  const handleChangeRoute = useHandleChangeRoute();
  const { values, setValues, errors, handleSave } = useValues({ type: 'create' });

  return (
      <Box minHeight='100%'>
        <div>
          <Container maxWidth='lg'>
            <BlogToolbar
              title='Create Post'
              showGreeting={true}
              buttons={[
                {
                  label: 'Cancel',
                  onClick: handleChangeRoute('/blog'),
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
          </Container>
        </div>
        <Divider />
        <Box style={{ paddingTop: 48, paddingBottom: 48 }}>
          <Container maxWidth='lg'>
            <BlogPostCreateForm values={values} setValues={setValues} errors={errors} />
          </Container>
        </Box>
      </Box>
  );
};

export default BlogPostCreate;
