import React from 'react';
import GenericDialog from '../GenericDialog';
import { isEmpty, isTrue, uuid } from '../../../../helpers';
import { useDialogState } from '../useDialogState';
import { useSetUser } from '../../../layout/store';
import { DialogContent, Grid, Typography, Button, Divider } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useFullScreen } from '../../../../hooks';
import TextLabel from '../../DialogField/TextLabel';
import YesNoAlignRight from '../../DialogField/YesNoAlignRight';
import { isFunction } from '../../GenericTable/helpers';
import { useSelector } from 'react-redux';
import { tables } from '../../../../database/dbConfig';
import useProcessData from '../../../../database/useProcessData';
import SelectLabel from '../../DialogField/SelectLabel';

export const title = 'Sign Up Survey';

const ageRangeItems = ['Under 18', '18-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75 or older', 'Prefer not to say'].map(v => ({ label: v, value: v }));
const fields = [
  {
    id: 'email',
    hidden: true
  },
  {
    id: 'date',
    hidden: true
  },
  {
    id: 'How did you hear about MINDapps?',
    label: 'How did you hear about MINDapps?',
    autoFocus: true,
    rows: 2,
    Field: TextLabel,
    InputProps: {
      style: { background: 'white' }
    }
  },
  {
    id: 'Are you a mental health care professional?',
    label: 'Are you a mental health care professional?',
    Field: YesNoAlignRight,
    required: true,
    InputProps: {
      style: { background: 'white' }
    }
  },
  {
    id: 'Are you a student?',
    label: 'Are you a student?',
    required: true,
    Field: YesNoAlignRight,
    InputProps: {
      style: { background: 'white' }
    }
  },
  {
    id: 'Are you affiliated with an organization/school?',
    label: 'Are you affiliated with an organization/school?',
    Field: YesNoAlignRight,
    InputProps: {
      style: { background: 'white' }
    }
  },
  {
    id: 'If so, please indicate which organization/school?',
    label: 'If so, please indicate which organization/school?',
    Field: TextLabel,
    hidden: values => (isTrue(values['Are you affiliated with an organization/school?']) ? false : true),
    InputProps: {
      style: { background: 'white' }
    }
  },
  { Field: () => <Divider sx={{ my: 1, background: 'white' }} /> },
  {
    id: 'Please select your age range:',
    label: 'Please select your age range:',
    Field: SelectLabel,
    items: ageRangeItems,
    required: true,
    InputProps: {
      style: { background: 'white' }
    }
  },
  {
    id: 'Please share any additional information that may be relevant:',
    label: 'Please share any additional information that may be relevant:',
    rows: 2,
    Field: TextLabel,
    InputProps: {
      style: { background: 'white' }
    }
  },
  {
    id: 'Are you okay with receiving email updates from our team?',
    label: 'Are you okay with receiving email updates from our team?',
    required: true,
    Field: YesNoAlignRight,
    InputProps: {
      style: { background: 'white' }
    }
  },
  {
    id: 'id',
    hidden: true
  }
];

export const columns = fields.filter(f => !isEmpty(f.id)).map(f => ({ name: f.id })); // For csv export

const validate = values => {
  var errors = {};
  fields
    .filter(f => f.required)
    .forEach(f => {
      if (isEmpty(values[f.id]) && values[f.id] !== false) {
        errors[f.id] = 'Required!';
      }
    });

  if (isTrue(values['Are you affiliated with an organization/school?'])) {
    if (isEmpty(values['If so, please indicate which organization/school?'])) {
      errors['If so, please indicate which organization/school?'] = 'Required!';
    }
  }

  console.log({ errors, values, fields });
  return errors;
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

function Content({ fields, values = {}, mapField, fullWidth, setValues, ...props }) {
  const classes = useStyles();
  const [state, setState] = useDialogState(title);
  const { errors = {} } = state;
  const dialogStateStr = JSON.stringify(state);
  const setUser = useSetUser();
  const email = useSelector(s => s.layout?.user?.attributes?.name);

  const values_str = JSON.stringify(values);

  const processData = useProcessData();

  const handleSubmit = React.useCallback(() => {
    const values = JSON.parse(values_str);
    const errors = validate(values);
    if (Object.keys(errors)?.length > 0) {
      console.log('Validation error', errors);
      setState(p => ({ ...p, errors }));
    } else {
      const Data = { id: uuid(), email, date: new Date().toISOString(), ...values };
      console.log('Submitting initial survey results', Data);
      processData({
        Model: tables.signUpSurveys,
        Action: 'c',
        Data,
        onError: () => setState(prev => ({ ...prev, loading: false, error: 'Error submitting values' })),
        onSuccess: () => {
          setState({ open: false });
          setValues({});
          alert('Survey results submitted.  Thank you!');
        }
      });
    }
  }, [setUser, dialogStateStr, setState, errors, values_str, email]);

  var submitLabel = 'Submit';

  const handleChange = React.useCallback(
    id => e => {
      setValues(p => ({ ...p, [id]: e?.target?.value }));
      setState(p => ({ ...p, errors: { ...p.errors, [id]: undefined } }));
    },
    [setValues]
  );

  return (
    <DialogContent className={classes.content}>
      <Grid container style={{ paddingBottom: 32 }} spacing={6}>
        <Grid item xs={12}>
          <Grid container alignItems='center' spacing={0} className={classes.infoContainer}>
            <Grid item xs={12}>
              <Typography variant='h5' textAlign='center'>
                Thanks for signing up!
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ mt: 1, background: 'white' }} />
            </Grid>
            <Grid item xs={12}>
              <Grid container style={{ marginTop: 8, marginBottom: 8 }} alignItems='center' spacing={1}>
                {fields.map(({ id, Field, hidden, ...other }) => {
                  const isHidden = isFunction(hidden) ? hidden(values) : hidden;
                  return isHidden ? (
                    <></>
                  ) : (
                    <Grid item xs={12}>
                      <Field id={id} value={values[id]} error={errors[id]} onChange={handleChange(id)} {...other} />
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
            <Grid item xs={12} sx={{ textAlign: 'center', pt: 3 }}>
              <Button onClick={handleSubmit} className={classes.primaryButton}>
                {submitLabel}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </DialogContent>
  );
}

export default function SignUpSurveyDialog({ id = title }) {
  const fs = useFullScreen('sm');
  return (
    <GenericDialog
      id={id}
      maxWidth='xs'
      PaperProps={{
        style: {
          borderRadius: fs ? 0 : 25
        }
      }}
      title=''
      divider={false}
      dialogActions={false}
      Content={Content}
      fields={fields}
    />
  );
}
