import React from 'react';
import { useChangeRoute, useUserEmail } from '../../layout/hooks';
import { categories } from '../../application/Blog/post';
import { blogApi } from '../../../__fakeApi__/blogApi';
import { isEmpty } from '../../../helpers';

const validate = values => {
  const newErrors = {};
  ['title', 'shortDescription', 'category', 'readTime', 'publishedAt'].forEach(k => {
    if (isEmpty(values[k])) {
      newErrors[k] = 'Required';
    }
  });
  return newErrors;
};

const useValues = ({ type = 'create', values: Values = undefined }) => {
  const changeRoute = useChangeRoute();
  const email = useUserEmail();

  const initialValues = Values ?? {
    title: '',
    shortDescription: '',
    category: categories[0],
    content: '',
    readTime: '5 min',
    publishedAt: new Date().getTime(),
    publishedGlobally: true,
    enableComments: true,
    authorName: email,
    created: undefined,
    updated: undefined
  };

  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});

  const handleSave = React.useCallback(async () => {
    console.log(`${type} post...`);
    const post = { ...values };

    if (type === 'create') {
      post.created = new Date().getTime();
      post.createdBy = email;
    } else {
      post.updated = new Date().getTime();
      post.updatedBy = email;
    }

    setErrors({});
    const newErrors = validate(values);
    if (Object.keys(newErrors).length > 0) {
      console.log({ newErrors });
      setErrors(newErrors);
    } else {
      try {
        const result = await blogApi.updatePost(post);
        result && changeRoute('/blog');
      } catch (err) {
        alert('Error publishing content.');
        console.error(err);
      }
    }
    // eslint-disable-next-line
  }, [values, JSON.stringify(values), changeRoute, email, type]);

  return { values, setValues, setErrors, handleSave, errors };
};

export default useValues;
