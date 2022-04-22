import React from 'react';
import { useUserEmail } from '../../layout/hooks';
import { isEmpty, uuid } from '../../../helpers';
import { useEffect } from 'react';
import { useDatabaseRow } from '../../../database/useTableState';
import { tables } from '../../../database/dbConfig';
import useProcessData from '../../../database/useProcessData';

const useSurvey = ({ type = 'create', trigger = false, values: Values = undefined } = {}) => {
  const email = useUserEmail();

  var initialValues = Values ?? {};

  const _id = initialValues?._id;

  const [cachedValues] = useDatabaseRow(tables.surveys, _id);

  if (!isEmpty(_id) && !isEmpty(cachedValues)) {
    initialValues = { ...initialValues, ...cachedValues }; // Load cached values if present, for faster page loads
  }

  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const processData = useProcessData();
  const getRow = React.useCallback(
    (_id, onSuccess = undefined) => {
      setLoading(true);
      processData({
        Action: 'r',
        Model: tables.surveys,
        Snackbar: null,
        Data: {
          _id
        } as any,
        onSuccess: result => {
          setValues(result.Item);
          setLoading(false);
          onSuccess && onSuccess(result);
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
        Model: tables.surveys,
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
    trigger === true && type === 'view' && _id && getRow(_id);
  }, [trigger, _id, type, getRow]);

  const handleSave = React.useCallback(
    async ({ values: Values = undefined, onSuccess = undefined, onError = undefined, idKey = '_id', validate = undefined }) => {
      const row = { ...(Values ?? values) };

      if (type === 'create') {
        row[idKey] = uuid();
        row.created = new Date().getTime();
        row.createdBy = email;
      } else {
        row.updated = new Date().getTime();
        row.updatedBy = email;
      }

      setErrors({});
      const newErrors = validate ? validate(values) : {};
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        onError && onError(newErrors);
      } else {
        updateRow({
          row,
          onSuccess: result => {
            onSuccess && onSuccess(result);
          },
          onError: err => {
            alert('Error saving survey.');
            console.error({ err });
            onError && onError(err);
          }
        });
      }
    },
    // eslint-disable-next-line
    [values, JSON.stringify(values), email, type]
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

export default useSurvey;
