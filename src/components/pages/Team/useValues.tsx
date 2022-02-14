import React from 'react';
import { useChangeRoute, useUserEmail } from '../../layout/hooks';
import { useDefaultValues } from '../../../database/models/Team';
import { isEmpty, publicUrl, uuid } from '../../../helpers';
import { useEffect } from 'react';
import { useDatabaseRow } from '../../../database/useTableState';
import { tables } from '../../../database/dbConfig';
import useProcessData from '../../../database/useProcessData';
import { uploadFiles } from '../../../database/utils';

const table = tables.team;

const validate = values => {
  const newErrors = {};
  ['title'].forEach(k => {
    if (isEmpty(values[k])) {
      newErrors[k] = 'Required';
    }
  });
  return newErrors;
};

const useValues = ({ type = 'create', trigger = false, values: Values = undefined, category: Category = undefined }) => {
  const changeRoute = useChangeRoute();
  const email = useUserEmail();

  var initialValues = useDefaultValues(Values ?? {});

  const _id = initialValues?._id;

  const [cachedValues] = useDatabaseRow(table, _id);

  if (!isEmpty(_id) && !isEmpty(cachedValues)) {
    initialValues = { ...initialValues, ...cachedValues }; // Load cached values if present, for faster page loads
  }

  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const processData = useProcessData();
  const getRow = React.useCallback(
    _id => {
      setLoading(true);
      processData({
        Action: 'r',
        Model: table,
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

  const updateRow = React.useCallback(
    ({ row, onSuccess: OnSuccess, onError: OnError }) => {
      setLoading(true);
      processData({
        Action: 'u',
        Model: table,
        Snackbar: null,
        Data: {
          ...row
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
    trigger && _id && getRow(_id);
  }, [trigger, _id, type, getRow]);

  const handleSave = React.useCallback(
    async ({ values: Values = undefined, onSuccess = undefined, onError = undefined, idKey = '_id' }) => {
      setLoading(true);
      const row = { ...(Values ?? values) };
      setErrors({});
      const newErrors = validate(values);
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        onError && onError(newErrors);
        return;
      }
      const keysToUpload = ['cover'];
      const { responses, errors } = await uploadFiles({ keysToUpload, values });
      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        setLoading(false);
        onError && onError(errors);
        return;
      }
      // Change all file objects to string key to signify that the file has been uploaded and store link
      Object.keys(responses).forEach(k => (row[k] = responses[k].key));

      if (type === 'create') {
        row[idKey] = uuid();
        row.created = new Date().getTime();
        row.createdBy = email;
      } else {
        row.updated = new Date().getTime();
        row.updatedBy = email;
      }

      updateRow({
        row,
        onSuccess: result => {
          changeRoute(publicUrl('/Community'), prev => ({ ...prev, subRoute: 'team' }));
          setLoading(false);
          onSuccess && onSuccess(result);
        },
        onError: err => {
          alert('Error publishing content.');
          console.error({ err });
          setLoading(false);
          onError && onError(err);
        }
      });
    },
    // eslint-disable-next-line
    [values, JSON.stringify(values), updateRow, changeRoute, email, type]
  );

  const handleDelete = React.useCallback(
    ({ deleted = true, onSuccess }) => {
      handleSave({ values: { ...values, deleted }, onSuccess });
    },
    // eslint-disable-next-line
    [handleSave, JSON.stringify(values)]
  );

  return { values, setValues, setErrors, handleSave, handleDelete, errors, getRow, loading };
};

export default useValues;
