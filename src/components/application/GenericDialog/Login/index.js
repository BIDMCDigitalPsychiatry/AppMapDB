import React from 'react';
import GenericDialog from '../GenericDialog';
import { copyToLower, isEmpty as isValEmpty } from '../../../../helpers';
import firebase from 'firebase/app';
import 'firebase/auth';
import { useDialogState } from '../useDialogState';
import DialogButton from '../DialogButton';
import Label from '../../DialogField/Label';

export const title = 'Login';

const handleValidation = ({ message }, dialogState) => {
  var errors = copyToLower(dialogState.errors); // start with server generated errors, ensure all keys start with lowercase letter

  if (!isValEmpty(message)) {
    if (message.includes('password') || message.includes('Password')) {
      errors['password'] = message;
    } else {
      errors['email'] = message;
    }
  }

  return errors;
};

const ForgotPassword = ({ value = false, onChange }) => {
  const handleClick = () => onChange({ target: { value: !value } });
  return (
    <DialogButton variant='link' tooltip='' onClick={handleClick}>
      {value ? 'Back' : 'Forgot Password'}
    </DialogButton>
  );
};

export default function LoginDialog({ id = title }) {
  const [dialogState, setState] = useDialogState(id);
  const { errors } = dialogState;
  const dialogStateStr = JSON.stringify(dialogState);

  const handleAdd = React.useCallback(
    ({ forgotPassword, email, password }) => {
      if (forgotPassword) {
        firebase
          .auth()
          .sendPasswordResetEmail(email)
          .then((success) => {
            alert('An email has been sent with instructions for resetting your password.');
            setState((prev) => ({ ...prev, loading: false, open: false }));
          })
          .catch((error) => {
            console.error('Error requesting reset');
            const { message } = error;
            const newErrors = handleValidation({ ...errors, message }, JSON.parse(dialogStateStr));
            setState((prev) => ({ ...prev, loading: false, showErrors: true, errors: newErrors }));
          });
      } else {
        firebase.login({ email, password }).catch((error) => {
          console.error('Error with Login');
          const { message } = error;
          const newErrors = handleValidation({ ...errors, message }, JSON.parse(dialogStateStr));
          setState((prev) => ({ ...prev, loading: false, showErrors: true, errors: newErrors }));
        });
      }
    },
    [dialogStateStr, setState, errors]
  );

  return (
    <GenericDialog
      id={id}
      title={id}
      onSubmit={handleAdd}
      validate={handleValidation}
      submitLabel={(values) => (values.forgotPassword ? 'Request Reset' : id)}
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
          },
          hidden: (values) => values.forgotPassword
        },
        {
          id: 'forgotPasswordLabel',
          label: 'Enter your email address and press request reset. We will send you an email to reset your password.',
          Field: Label,
          initialValue: false,
          hidden: (values) => !values.forgotPassword
        },
        {
          id: 'forgotPassword',
          label: 'Forgot Password',
          Field: ForgotPassword,
          initialValue: false
        }
      ]}
    />
  );
}
