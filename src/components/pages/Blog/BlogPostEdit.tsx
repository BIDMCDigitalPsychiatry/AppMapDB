import React from 'react';
import { Box, Container, Divider } from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import BlogPostCreateForm from '../../application/Blog/BlogPostCreateForm';
import { useHandleChangeRoute } from '../../layout/hooks';
import BlogToolbar from './BlogToolbar';
import useValues from './useValues';
import { publicUrl } from '../../../helpers';

const BlogPostEdit = ({ values: Values }) => {
  const handleChangeRoute = useHandleChangeRoute();
  const { values, setValues, errors, handleSave } = useValues({ type: 'edit', values: Values });

  return (
    <Container maxWidth='lg'>
      <BlogToolbar
        title='Edit Post'
        showGreeting={true}
        buttons={[
          {
            label: 'Cancel',
            onClick: handleChangeRoute(publicUrl('/connect'), prev => ({ ...prev, subRoute: 'list' })),
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

export default BlogPostEdit;
