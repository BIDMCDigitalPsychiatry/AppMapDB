import React from 'react';
import GenericDialog from '../GenericDialog';
import { copyToLower, isEmpty as isValEmpty } from '../../../../helpers';
import firebase from 'firebase/app';
import 'firebase/auth';
import { useDialogState } from '../useDialogState';

export const title = 'Sign Up';

const handleValidation = ({ password, confirmPassword, message }, dialogState) => {
  var errors = copyToLower(dialogState.errors); // start with server generated errors, ensure all keys start with lowercase letter

  if (password !== confirmPassword) {
    errors['confirmPassword'] = 'Passwords must match.';
    errors['password'] = 'Passwords must match.';
  }

  if (!isValEmpty(message)) {
    if (message.includes('password') || message.includes('Password')) {
      errors['confirmPassword'] = message;
      errors['password'] = message;
    } else {
      errors['email'] = message;
    }
  }

  return errors;
};

export default function RegisterDialog({ id = title }) {
  const [dialogState, setState] = useDialogState(id);
  const { errors } = dialogState;
  const dialogStateStr = JSON.stringify(dialogState);

  const handleAdd = React.useCallback(
    ({ email, password }) => {
      console.log('Performing Register');
      firebase.createUser({ email, password }, { username: email, email }).catch(error => {
        console.log('Error with Register');
        const { message } = error;
        const newErrors = handleValidation({ ...errors, message }, JSON.parse(dialogStateStr));
        setState(prev => ({ ...prev, showErrors: true, loading: false, errors: newErrors }));
      });
    },
    [dialogStateStr, setState, errors]
  );

  return (
    <GenericDialog
      id={id}
      title={id}
      submitLabel={id}
      onSubmit={handleAdd}
      validate={handleValidation}
      fields={[
        {
          id: 'email',
          label: 'Email',
          required: true,
          email: true
        },
        {
          id: 'password',
          label: 'Password',
          required: true,
          inputProps: {
            type: 'password'
          }
        },
        {
          id: 'confirmPassword',
          label: 'Confirm Password',
          required: true,
          inputProps: {
            type: 'password'
          }
        }
      ]}
    />
  );
}
