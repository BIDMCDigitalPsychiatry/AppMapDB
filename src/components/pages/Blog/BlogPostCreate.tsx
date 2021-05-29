import React from 'react';
import { Box, Container, Divider } from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import BlogPostCreateForm from '../../application/Blog/BlogPostCreateForm';
import { useChangeRoute, useHandleChangeRoute, useUserEmail } from '../../layout/hooks';
import BlogToolbar from './BlogToolbar';
import { categories } from '../../application/Blog/post';
import { blogApi } from '../../../__fakeApi__/blogApi';

const BlogPostCreate = () => {
  const handleChangeRoute = useHandleChangeRoute();
  const changeRoute = useChangeRoute();

  const email = useUserEmail();

  const [values, setValues] = React.useState({
    title: '',
    shortDescription: '',
    category: categories[0],
    content: '',
    readTime: '5 min',
    publishedAt: new Date().getTime(),
    publishedGlobally: true,
    enableComments: true,
    authorName: email
  });

  const [errors, setErrors] = React.useState({});

  const handleSave = React.useCallback(async () => {
    console.log('Saving post...');
    const post = { ...values, createdBy: email, created: new Date().getTime() };
    try {
      const result = await blogApi.updatePost(post);
      result && changeRoute('/blog');
    } catch (err) {
      console.log('Error saving post');
      alert('Error publishing content.');
      console.error(err);
    }
  }, [JSON.stringify(values), JSON.stringify(errors), changeRoute, email]);

  return (
    <>
      <Box
        style={{
          backgroundColor: 'background.paper',
          minHeight: '100%'
        }}
      >
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
            <BlogPostCreateForm values={values} setValues={setValues} errors={errors} handleSave={handleSave} />
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default BlogPostCreate;
