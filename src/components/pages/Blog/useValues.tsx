import React from 'react';
import { useChangeRoute, useUserEmail } from '../../layout/hooks';
import { categories } from '../../application/Blog/post';
import { blogApi } from '../../../__fakeApi__/blogApi';
import { isEmpty, uuid } from '../../../helpers';
import { useCallback, useEffect } from 'react';
import useMounted from '../../hooks/useMounted';

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
  const mounted = useMounted();

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

  const id = initialValues?.id;

  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const getPost = useCallback(
    async (postId = undefined) => {
      setLoading(true);
      try {
        const data = await blogApi.getPost(postId ?? id);
        mounted.current && setValues(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    },
    [id, mounted, setLoading]
  );

  useEffect(() => {
    type === 'view' && id && !loading && getPost(id);
  }, [id, type, getPost, loading]);

  const handleSave = React.useCallback(
    async ({ values: Values = undefined, onSuccess = undefined, onError = undefined }) => {
      console.log(`${type} post...`);
      const post = { ...(Values ?? values) };

      if (type === 'create') {
        post.id = uuid();
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
        onError && onError(newErrors);
      } else {
        try {
          const result = await blogApi.updatePost(post);
          result && changeRoute('/blog');
          result && onSuccess && onSuccess(result);
        } catch (err) {
          alert('Error publishing content.');
          console.error(err);
          onError && onError(err);
        }
      }
    },
    // eslint-disable-next-line
    [values, JSON.stringify(values), changeRoute, email, type]
  );

  const handleDelete = React.useCallback(
    ({ deleted = true, onSuccess }) => {
      handleSave({ values: { ...values, deleted }, onSuccess });
    },
    // eslint-disable-next-line
    [handleSave, JSON.stringify(values)]
  );

  return { values, setValues, setErrors, handleSave, handleDelete, errors, getPost, loading };
};

export default useValues;
