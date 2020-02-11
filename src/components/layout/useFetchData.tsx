import React from 'react';
import { evalFunc } from '../../helpers';
import { useProcessData } from '../../database/useProcessData';

export default function useFetchData({ onSuccess = undefined, onError = undefined }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({});
  const processData = useProcessData();
  const [data, setData] = React.useState(undefined); // Holds the server information of the last server that was successfully pre-created

  const fetchData = React.useCallback(
    pdi => {
      setLoading(true);
      processData({
        ...evalFunc(pdi),
        onSuccess: data => {
          setData(data); // Keep track of the server so it can be deleted if the user closes or hits the back button
          setLoading(false);
          setError(undefined);
          onSuccess && onSuccess(data);
        },
        onError: error => {
          setError(error);
          onError && onError(error);
        }
      });
    },
    [processData, setData, setError, setLoading, onSuccess, onError]
  );

  return { fetchData, data, loading, error };
}
