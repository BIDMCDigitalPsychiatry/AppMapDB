import * as React from 'react';
import { isEmpty } from '../helpers';
import useS3Bucket from './useS3Bucket';

const useS3FileUpload = () => {
  const [{ loading, uploading, error }, setState] = React.useState({ loading: false, success: false, uploading: false, error: null });
  const { handleUpload } = useS3Bucket({ setState });

  const s3FileUpload = async ({ id, file, fileBase64 = undefined, onSuccess = undefined, onError = undefined }) => {
    if (file) {
      if ((file as any).size > 20 * 1024 * 1024) {
        alert('File exceeds 20 MB upload limit.');
      } else {
        const blob = await fetch(fileBase64).then(res => res.blob());
        handleUpload({
          id,
          content: !isEmpty(fileBase64) ? blob : file, // If we passed the base64 contents, then use the resulting blob to upload
          level: 'public', // public or private
          contentType: `${file?.type ?? 'text/plain'}`,
          onStart: () => {
            setState(prev => ({ ...prev, uploading: true }));
          },
          onSuccess: () => {
            setState(prev => ({ ...prev, uploading: false }));
            onSuccess && onSuccess(id);
            // TODO update class with link to newly uploaded file
          },
          onError: () => {
            console.error('Error uploading file');
            setState(prev => ({ ...prev, uploading: false }));
            alert('Error uploading file');
            onError && onError('Error uploading file');
          }
        });
      }
    } else {
      // Error: No file specified or user hit cancel
    }
  };

  return { s3FileUpload, loading, uploading, error };
};

export default useS3FileUpload;
