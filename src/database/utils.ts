import { Storage } from 'aws-amplify';
import { isObject } from '../components/application/GenericTable/helpers';
import { isEmpty, uuid } from '../helpers';

async function uploadS3({
  id = `unknown_${uuid()}`,
  content = undefined,
  level = 'public', // public or private
  contentType = 'text/plain'
}) {
  console.log('Uploading file...', { id, contentType });
  return Storage.put(id, content, {
    level,
    contentType
  });
}

export async function uploadFile({ id, file, fileBase64 = undefined }) {
  if (file) {
    if ((file as any).size > 20 * 1024 * 1024) {
      throw new Error('File exceeds 20 MB upload limit.');
    } else {
      const blob = await fetch(fileBase64).then(res => res.blob());
      return await uploadS3({
        id,
        content: !isEmpty(fileBase64) ? blob : file, // If we passed the base64 contents, then use the resulting blob to upload
        level: 'public', // public or private
        contentType: `${file?.type ?? 'text/plain'}`
      });
    }
  } else {
    // Error: No file specified or user hit cancel
    throw new Error('No file specified');
  }
}

export const uploadFiles = async ({ keysToUpload = [], values }) => {
  var responses = {};
  var errors = {};
  for (var k of keysToUpload) {
    var fileObj = values[k];
    if (fileObj && isObject(fileObj)) {
      const { base64, file, value } = fileObj;
      // Only try to upload object files.  If it is a string, then this is an already uploaded key pointing to the file
      console.log('uploading', { fileObj, value });
      try {
        var response = await uploadFile({
          id: value,
          file,
          fileBase64: base64
        });
        responses[k] = response;
      } catch (err) {
        errors[k] = err;
      }
    }
  }
  return { responses, errors };
};
