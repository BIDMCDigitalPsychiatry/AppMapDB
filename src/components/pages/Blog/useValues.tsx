import React from 'react';
import { useChangeRoute, useUserEmail } from '../../layout/hooks';
import { categories, useDefaultValues } from '../../../database/models/Post';
import { isEmpty, uuid } from '../../../helpers';
import { useEffect } from 'react';
import { useDatabaseRow } from '../../../database/useTableState';
import { tables } from '../../../database/dbConfig';
import useProcessData from '../../../database/useProcessData';
import Decimal from 'decimal.js-light';

const validate = values => {
  const newErrors = {};
  ['title', 'shortDescription', 'category', 'readTime', 'publishedAt'].forEach(k => {
    if (isEmpty(values[k])) {
      newErrors[k] = 'Required';
    }
  });

  if (!isEmpty(values['cover'])) {
    //size = (n * (3/4)) - y
    //size is the size of file in bytes
    //n is the length of the Base64 String
    //y will be 2 if Base64 ends with '==' and 1 if Base64 ends with '='.
    var n = values['cover'].length;
    var y = values['cover'].endsWith('==') ? 2 : 1;
    var isValid = new Decimal(n)
      .times(new Decimal(3 / 4))
      .minus(y)
      .lessThanOrEqualTo(350000); // <= 350 kb

    if (!isValid) {
      newErrors['cover'] = 'Image exceeds maximum size limit.  Size must be less than or equal to 300 kB.  Please select a new image';
    }
  }

  return newErrors;
};

const useValues = ({ type = 'create', trigger = false, values: Values = undefined, category: Category = undefined }) => {
  const changeRoute = useChangeRoute();
  const email = useUserEmail();

  var initialValues = useDefaultValues(
    Values ?? {
      category: Category ?? categories[0]
    }
  );

  const _id = initialValues?._id;

  const [cachedValues] = useDatabaseRow(tables.posts, _id);

  if (!isEmpty(_id) && !isEmpty(cachedValues)) {
    initialValues = { ...initialValues, ...cachedValues }; // Load cached values if present, for faster page loads
  }

  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const processData = useProcessData();
  const getPost = React.useCallback(
    _id => {
      setLoading(true);
      processData({
        Action: 'r',
        Model: tables.posts,
        Snackbar: null,
        Data: {
          _id
        } as any,
        onSuccess: result => {
          setValues(result.Item);
          setLoading(false);
        },
        onError: err => {
          setLoading(false);
        }
      });
    },
    [processData]
  );

  const updatePost = React.useCallback(
    ({ post, onSuccess: OnSuccess, onError: OnError }) => {
      setLoading(true);
      processData({
        Action: 'u',
        Model: tables.posts,
        Snackbar: null,
        Data: {
          ...post
        } as any,
        onSuccess: result => {
          setValues(result?.Item);
          setLoading(false);
          OnSuccess && OnSuccess(result);
        },
        onError: err => {
          setLoading(false);
          OnError && OnError(err);
        }
      });
    },
    [processData]
  );

  useEffect(() => {
    trigger === true && type === 'view' && _id && getPost(_id);
  }, [trigger, _id, type, getPost]);

  const handleSave = React.useCallback(
    async ({ values: Values = undefined, onSuccess = undefined, onError = undefined, idKey = '_id' }) => {
      const post = { ...(Values ?? values) };

      if (type === 'create') {
        post[idKey] = uuid();
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
        updatePost({
          post,
          onSuccess: result => {
            changeRoute('/blog', prev => ({ ...prev, blogLayout: 'list' }));
            onSuccess && onSuccess(result);
          },
          onError: err => {
            alert('Error publishing content.');
            console.error({ err });
            onError && onError(err);
          }
        });
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
