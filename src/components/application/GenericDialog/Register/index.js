import React from 'react';
import GenericDialog from '../GenericDialog';
import { copyToLower, isEmpty as isValEmpty } from '../../../../helpers';
import { useDialogState } from '../useDialogState';
import { Auth } from 'aws-amplify';
import DialogButton from '../DialogButton';
import { useLayout, useSetUser } from '../../../layout/store';
const passwordValidator = require('password-validator');
export const title = 'Sign Up';

// create a password schema
const schema = new passwordValidator();

schema.is().min(8).has().uppercase().has().lowercase().has().digits().has().symbols();

const formatPasswordValidateError = errors => {
  for (let i = 0; i < errors.length; i++) {
    if (errors[i] === 'min') {
      return 'password length should be a at least 8 characters';
    } else if (errors[i] === 'lowercase') {
      return 'password should contain lowercase letters';
    } else if (errors[i] === 'uppercase') {
      return 'password should contain uppercase letters';
    } else if (errors[i] === 'digits') {
      return 'password should contain digits';
    } else if (errors[i] === 'symbols') {
      return 'password should contain symbols';
    }
  }
};

const handleValidation = ({ password, confirmationCodeError, confirmPassword, message }, dialogState) => {
  var errors = copyToLower(dialogState.errors); // start with server generated errors, ensure all keys start with lowercase letter

  if (password !== confirmPassword) {
    errors['confirmPassword'] = 'Passwords must match.';
    errors['password'] = 'Passwords must match.';
  }

  const validationRulesErrors = schema.validate(password, { list: true });
  if (validationRulesErrors.length > 0) {
    errors['password'] = formatPasswordValidateError(validationRulesErrors);
  }

  if (!isValEmpty(message)) {
    if (message.includes('password') || message.includes('Password')) {
      errors['confirmPassword'] = message;
      errors['password'] = message;
    } else {
      errors['email'] = message;
    }
  }

  if (!isValEmpty(confirmationCodeError)) {
    errors['confirmationCode'] = confirmationCodeError;
  }

  return errors;
};

const EnterConfirmationCode = ({ value = false, onChange }) => {
  const handleClick = () => onChange({ target: { value: !value } });
  return (
    <DialogButton variant='link' tooltip='' onClick={handleClick}>
      {value ? 'Back' : 'Enter Verification Code'}
    </DialogButton>
  );
};

export default function RegisterDialog({ id = title }) {
  const [dialogState, setState] = useDialogState(id);
  const { confirm, errors } = dialogState;
  const dialogStateStr = JSON.stringify(dialogState);  

  const setUser = useSetUser();

  const handleAdd = React.useCallback(
    ({ email, password }, setValues) => {
      Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
          name: email
        }
      })
        .then(result => {
          console.log('Succesfully signed up user!');
          setState(prev => ({ ...prev, open: true, loading: false }));
          setValues(prev => ({ ...prev, confirm: true }));
        })
        .catch(err => {
          console.error('Error with Register');
          const newErrors = handleValidation({ ...errors, message: err.message }, JSON.parse(dialogStateStr));
          setState(prev => ({ ...prev, showErrors: true, loading: false, errors: newErrors }));
        });
    },
    [dialogStateStr, setState, errors]
  );

  const handleConfirm = React.useCallback(
    ({ email, password, confirmationCode }, setValues) => {
      Auth.confirmSignUp(email, confirmationCode)
        .then(() => {
          console.log('Confirmed account!');
          setState(prev => ({ ...prev, open: false, loading: false, confirm: false }));
          Auth.signIn(email, password)
            .then(user => {
              setUser(user);
            })
            .catch(err => {
              console.error('Error with Login');
              console.error(err);
            });
        })
        .catch(err => {
          console.error('Invalid code');
          console.error(err);
          const newErrors = handleValidation({ ...errors, confirmationCodeError: err.message }, JSON.parse(dialogStateStr));
          setState(prev => ({ ...prev, loading: false, showErrors: true, errors: newErrors }));
        });
    },
    [setUser, dialogStateStr, setState, errors]
  );

  const handleSubmit = React.useCallback(
    ({ confirm, ...other }, setValues) => (confirm ? handleConfirm(other, setValues) : handleAdd(other, setValues)),
    [handleConfirm, handleAdd]
  );

  return (
    <GenericDialog
      id={id}
      title={id}
      submitLabel={values => (values.confirm ? 'Confirm' : id)}
      onSubmit={handleSubmit}
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
          },
          hidden: ({ confirm }) => confirm
        },
        {
          id: 'confirmPassword',
          label: 'Confirm Password',
          required: true,
          inputProps: {
            type: 'password'
          },
          hidden: ({ confirm }) => confirm
        },
        {
          id: 'confirmationCode',
          label: 'Enter Verification Code Sent to above Email Address',
          required: confirm ? true : false,
          hidden: ({ confirm }) => !confirm
        },
        {
          id: 'confirm',
          label: 'Enter Verification Code',
          Field: EnterConfirmationCode,
          initialValue: false
        }
      ]}
    />
  );
}
