import React from 'react';
import GenericDialog from '../GenericDialog';
import { copyToLower, isEmpty as isValEmpty } from '../../../../helpers';
import { useDialogState } from '../useDialogState';
import DialogButton from '../DialogButton';
import Label from '../../DialogField/Label';
import { Auth } from 'aws-amplify';
import { useSetUser } from '../../../layout/store';

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
  const { enterNewPassword, errors } = dialogState;
  const dialogStateStr = JSON.stringify(dialogState);
  const setUser = useSetUser();

  const handleLogin = React.useCallback(
    ({ forgotPassword, confirmationCode, newPassword, email, password }) => {
      if (forgotPassword) {
        if (enterNewPassword) {
          Auth.forgotPasswordSubmit(email, confirmationCode, newPassword)
            .then(data => {
              alert('Successfully updated password.');
              Auth.signIn(email, newPassword)
                .then(user => {
                  console.log('Login success!', user);
                  setUser(user);
                  setState(prev => ({ ...prev, open: false, loading: false, errors: {} }));
                })
                .catch(err => {
                  console.error('Error with Login');
                  console.error(err);
                  const newErrors = handleValidation({ ...errors, message: err.message }, JSON.parse(dialogStateStr));
                  setState(prev => ({ ...prev, loading: false, showErrors: true, errors: newErrors }));
                });
            })
            .catch(err => {
              console.error('Error resetting password');
              console.error(err);
              const newErrors = handleValidation({ ...errors, message: err.message }, JSON.parse(dialogStateStr));
              setState(prev => ({ ...prev, loading: false, showErrors: true, errors: newErrors }));
            });
        } else {
          Auth.forgotPassword(email)
            .then(data => {
              alert('An email has been sent with instructions for resetting your password.');
              setState(prev => ({ ...prev, loading: false, enterNewPassword: true }));
            })
            .catch(err => {
              console.error('Error requesting reset');
              const newErrors = handleValidation({ ...errors, message: err.message }, JSON.parse(dialogStateStr));
              setState(prev => ({ ...prev, loading: false, showErrors: true, errors: newErrors }));
            });
        }
      } else {
        Auth.signIn(email, password)
          .then(user => {
            console.log('Login success!', user);
            setUser(user);
            setState(prev => ({ ...prev, open: false, loading: false, errors: {} }));
          })
          .catch(err => {
            console.error('Error with Login');
            console.error(err);
            const newErrors = handleValidation({ ...errors, message: err.message }, JSON.parse(dialogStateStr));
            setState(prev => ({ ...prev, loading: false, showErrors: true, errors: newErrors }));
          });
      }
    },
    [enterNewPassword, setUser, dialogStateStr, setState, errors]
  );

  return (
    <GenericDialog
      id={id}
      title={id}
      onSubmit={handleLogin}
      validate={handleValidation}
      submitLabel={values => (values.forgotPassword ? (enterNewPassword ? 'Change Password' : 'Request Reset') : id)}
      fields={[
        {
          id: 'email',
          label: 'Email',
          required: true,
          email: true,
          hidden: enterNewPassword
        },
        {
          id: 'password',
          label: 'Password',
          required: true,
          inputProps: {
            type: 'password'
          },
          hidden: values => values.forgotPassword || enterNewPassword
        },
        {
          id: 'forgotPasswordLabel',
          label: 'Enter your email address and press request reset. We will send you an email with a code to reset your password.',
          Field: Label,
          initialValue: false,
          hidden: values => !values.forgotPassword || enterNewPassword
        },
        {
          id: 'forgotPassword',
          label: 'Forgot Password',
          Field: ForgotPassword,
          initialValue: false,
          hidden: enterNewPassword
        },
        {
          id: 'confirmationCode',
          label: 'Enter Verification Code Sent to Email Address',
          required: true,
          hidden: !enterNewPassword
        },
        {
          id: 'newPassword',
          label: 'New Password',
          required: true,
          inputProps: {
            type: 'password'
          },
          hidden: !enterNewPassword
        }
      ]}
    />
  );
}
