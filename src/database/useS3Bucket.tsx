import * as React from 'react';
import { Storage } from 'aws-amplify';
import { uuid } from '../helpers';

export default function useS3Bucket({ setState = undefined } = {}) {
  const handleUpload = React.useCallback(
    ({
      id = `unknown_${uuid()}`,
      content = undefined,
      level = 'public', // public or private
      contentType = 'text/plain',
      onStart = undefined,
      onSuccess = undefined,
      onError = undefined
    }) => {
      console.log('Uploading file...');
      onStart && onStart();
      setState && setState(prev => ({ ...prev, loading: true, success: false }));
      Storage.put(id, content, {
        level,
        contentType
      })
        .then(result => {
          console.log({ status: 'Successfully uploaded file', result });
          onSuccess && onSuccess(result);
          setState && setState(prev => ({ ...prev, loading: false, success: true }));
        })
        .catch(err => {
          console.error({ status: 'Error uploading file', err });
          onError && onError(err);
          setState && setState(prev => ({ ...prev, loading: false, success: false }));
        });
    },
    [setState]
  );

  return { handleUpload };
}
