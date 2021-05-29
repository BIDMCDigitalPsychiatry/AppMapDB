import React from 'react';
import { Box, Container, Divider } from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import BlogPostCreateForm from '../../application/Blog/BlogPostCreateForm';
import { useChangeRoute, useHandleChangeRoute, useUserEmail } from '../../layout/hooks';
import BlogToolbar from './BlogToolbar';
import { blogApi } from '../../../__fakeApi__/blogApi';

const BlogPostEdit = ({ values: Values }) => {
  const handleChangeRoute = useHandleChangeRoute();
  const changeRoute = useChangeRoute();

  const [values, setValues] = React.useState(Values);
  const [errors, setErrors] = React.useState({});

  const email = useUserEmail();

  const handleSave = React.useCallback(async () => {
    console.log('Updating post...');    
    const post = { ...values, updatedBy: email, updated: new Date().getTime() };
    try {
      const result = await blogApi.updatePost(post);
      result && changeRoute('/blog');
    } catch (err) {
      console.log('Error updating post');
      console.error(err);
    }
  }, [JSON.stringify(values), JSON.stringify(errors), email]);

  return (
    <>
      <Box
        style={{
          minHeight: '100%'
        }}
      >
        <div>
          <Container maxWidth='lg'>
            <BlogToolbar
              title='Edit Post'
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

export default BlogPostEdit;
