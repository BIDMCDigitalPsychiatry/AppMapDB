import React from 'react';
import { useEffect } from 'react';
import { tables } from '../../../../database/dbConfig';
import useProcessData from '../../../../database/useProcessData';

const table = tables.surveys;

const useValues = ({ trigger = false, values: Values = undefined }) => {
  var initialValues = Values;

  const _id = initialValues?._id;

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

  useEffect(() => {
    trigger && _id && getRow(_id);
  }, [trigger, _id, getRow]);

  const handleDelete = React.useCallback(
    ({ deleted = true, onSuccess = undefined, onError = undefined }) => {
      setLoading(true);
      processData({
        Action: 'u',
        Model: table,
        Snackbar: null,
        Data: {
          ...values,
          deleted
        } as any,
        onSuccess: result => {
          setLoading(false);
          onSuccess && onSuccess(result);
        },
        onError: err => {
          setLoading(false);
          onError && onError(err);
        }
      });
    },
    // eslint-disable-next-line
    [processData, setLoading, JSON.stringify(values)]
  );

  return { values, setValues, setErrors, handleDelete, errors, getRow, loading };
};

export default useValues;
