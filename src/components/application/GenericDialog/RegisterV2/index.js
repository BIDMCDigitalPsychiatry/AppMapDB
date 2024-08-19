import React from 'react';
import GenericDialog from '../GenericDialog';
import { copyToLower, isEmpty as isValEmpty } from '../../../../helpers';
import { useDialogState } from '../useDialogState';
import { Auth } from 'aws-amplify';
import DialogButton from '../DialogButton';
import { useSetUser } from '../../../layout/store';
import RateAnApp from './RateAnApp';
import { DialogContent, Grid, Typography, Button, Box } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { InjectField } from '../Fields';
import { useFullScreen } from '../../../../hooks';
import TextLabel from '../../DialogField/TextLabel';
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
    <DialogButton color='white' variant='link' tooltip='' onClick={handleClick}>
      {value ? 'Back' : 'Enter Verification Code'}
    </DialogButton>
  );
};

const borderRadius = 25;

const useStyles = makeStyles(({ palette }) =>
  createStyles({
    primaryButton: {
      borderRadius: 7,
      color: palette.common.white,
      background: palette.primary.dark,
      minWidth: 160,
      height: 40,
      '&:hover': {
        background: palette.primary.main
      }
    },
    rateAnApp: {
      background: palette.secondary.light,
      color: palette.text.primary,
      padding: 24,
      borderRadius
    },
    arrowRight: {
      color: palette.primary.light
    },
    infoContainer: {
      background: palette.primary.light,
      color: palette.common.white,
      borderRadius
    },
    content: {
      paddingLeft: 48,
      paddingRight: 48,
      paddingTop: 16,
      paddingBottom: 16,
      background: palette.primary.light,
      color: palette.common.white
    }
  })
);

function Content({ fields, values, mapField, fullWidth, setValues, ...props }) {
  const injectField = id => <InjectField id={id} fields={fields} values={values} setValues={setValues} mapField={mapField} fullWidth={fullWidth} {...props} />;

  const classes = useStyles();
  const fs = useFullScreen('sm');

  const [state, setState] = useDialogState(title);

  const { errors } = state;
  const { confirm } = values;
  const dialogStateStr = JSON.stringify(state);
  const setUser = useSetUser();

  const values_str = JSON.stringify(values);

  const handleAdd = React.useCallback(() => {
    const values = JSON.parse(values_str);
    const { email, password } = values;

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
  }, [dialogStateStr, setState, errors, values_str, setValues]);

  const handleConfirm = React.useCallback(() => {
    const values = JSON.parse(values_str);
    const { email, password, confirmationCode } = values;
    Auth.confirmSignUp(email, confirmationCode)
      .then(() => {
        console.log('Confirmed account!');
        setState(prev => ({ ...prev, open: false, loading: false, confirm: false }));
        Auth.signIn(email, password)
          .then(user => {
            console.log('Login success!');
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
  }, [setUser, dialogStateStr, setState, errors, values_str]);

  var submitLabel = confirm ? 'Confirm' : 'Create Account';

  return (
    <DialogContent className={classes.content}>
      <Grid container style={{ paddingBottom: 32 }} spacing={6}>
        <Grid item xs={fs ? 12 : 6}>
          <Grid container alignItems='center' spacing={0} className={classes.infoContainer}>
            <Grid item xs={12}>
              <Typography variant='h5'>Sign Up as a Rater - Internal Platform:</Typography>
            </Grid>
            <Grid item xs={12}>
              <Grid container style={{ marginTop: 8, marginBottom: 8 }} alignItems='center' spacing={1}>
                <Grid item xs={12}>
                  {injectField('email')}
                </Grid>
                <Grid item xs={12}>
                  {injectField('password')}
                </Grid>
                <Grid item xs={12}>
                  {injectField('confirmPassword')}
                </Grid>
                <Grid item xs={12}>
                  {injectField('confirmationCode')}
                </Grid>
                <Grid item xs={12}>
                  {injectField('confirm')}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} style={{ textAlign: 'center' }}>
              <Button onClick={confirm ? handleConfirm : handleAdd} className={classes.primaryButton}>
                {submitLabel}
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={fs ? 12 : 6}>
          <Box mt={2}>
            <RateAnApp onClick={() => setState(prev => ({ ...prev, open: false }))} />
          </Box>
        </Grid>
      </Grid>
    </DialogContent>
  );
}

export default function RegisterDialog({ id = title }) {
  const [dialogState] = useDialogState(id);
  const { confirm } = dialogState;

  const fs = useFullScreen('sm');

  return (
    <GenericDialog
      id={id}
      maxWidth='md'
      PaperProps={{
        style: {
          borderRadius: fs ? 0 : 25
        }
      }}
      title=''
      divider={false}
      dialogActions={false}
      validate={handleValidation}
      Content={Content}
      fields={[
        {
          id: 'email',
          label: 'Email',
          autoFocus: true,
          required: true,
          email: true,
          Field: TextLabel,
          InputProps: {
            style: { background: 'white' }
          }
        },
        {
          id: 'password',
          label: 'Password',
          Field: TextLabel,
          required: true,
          inputProps: {
            type: 'password'
          },
          InputProps: {
            style: { background: 'white' }
          },
          hidden: ({ confirm }) => confirm
        },
        {
          id: 'confirmPassword',
          label: 'Confirm Password',
          Field: TextLabel,
          required: true,
          inputProps: {
            type: 'password'
          },
          InputProps: {
            style: { background: 'white' }
          },
          hidden: ({ confirm }) => confirm
        },
        {
          id: 'confirmationCode',
          label: 'Enter Verification Code Sent to above Email Address',
          Field: TextLabel,
          required: confirm ? true : false,
          hidden: ({ confirm }) => !confirm,
          InputProps: {
            style: { background: 'white' }
          }
        },
        {
          id: 'confirm',
          label: 'Enter Verification Code',
          Field: EnterConfirmationCode,
          initialValue: false,
          InputProps: {
            style: { background: 'white' }
          }
        }
      ]}
    />
  );
}
