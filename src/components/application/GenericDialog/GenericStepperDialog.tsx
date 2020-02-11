import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { makeStyles, createStyles } from '@material-ui/styles';
import CloseIcon from '@material-ui/icons/Close';
import {
  IconButton,
  Grid,
  Tooltip,
  Step,
  MobileStepper,
  Collapse,
  Chip,
  CircularProgress,
  useTheme,
} from '@material-ui/core';
import { useDialogState } from './useDialogState';
import Paper from '@material-ui/core/Paper';
import Draggable from 'react-draggable';
import merge from 'deepmerge';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import CheckIcon from '@material-ui/icons/CheckCircleOutline';
import DeleteIcon from '@material-ui/icons/Delete';
import { isEnabled, useValues, isError } from './helpers';
import Fields from './Fields';
import OnActivate from './OnActivate';
import { useFullScreen } from '../../../hooks';
import ErrorGate from './ErrorGate';

function PaperComponent(props) {
  return (
    <Draggable cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

const useStyles = makeStyles(({ spacing, palette, layout }: any) =>
  createStyles({
    dialog: {
      display: 'flex',
      flexDirection: 'column',
      outline: 'none',
      border: `5px solid ${palette.primary}`,
    },
    capitalize: {
      textTransform: 'capitalize',
    },
    dialogActions: {
      margin: 0,
      padding: spacing(1),
      paddingTop: spacing(0.5),
      paddingBottom: spacing(0.5),
    },
    dialogTitle: {
      background: palette.primary.main,
      color: palette.common.white,
      margin: 0,
      padding: 0,
      paddingLeft: spacing(2),
      paddingRight: spacing(1),
    },
    closeButton: {
      color: 'inherit',
    },
    deleteButton: {
      color: palette.common.white,
      background: palette.error.main,
      '&:hover': {
        background: palette.error.dark,
      },
    },
    mobileStepper: {
      flexGrow: 1,
    },
    submitProgress: {
      color: palette.primary.light,
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -(layout.progressSize / 2),
      marginLeft: -(layout.progressSize / 2),
    },
  })
);

export interface FieldProps {
  id: string | number;
  label: string;
  type: string;
  Field?: Element;
  getValue?: (f: FieldProps, values: any) => any;
}
export interface ComponentProps {
  id: string;
  title: string;
  initialValues?: object;
  cancelLabel: string;
  deleteLabel: string;
  submitLabel: string;
  draggable: boolean;
  onSubmit: any;
  onDelete: any;
  validate: any;
  Content: any;
  steps: any[];
}

const GenericStepperDialog = ({
  id,
  title: Title, // Title can be set via the state as well as the input props, state takes priority
  initialValues: InitialValues = {}, // If initial values are provided they are merged with the initial values from the state
  draggable = false,
  cancelLabel = 'Cancel',
  deleteLabel = 'Delete',
  submitLabel,
  maxWidth = 'xs',
  steps = [] as any[],
  onSubmit,
  onDelete,
  onClose,
  Content,
  validate,
  ...other
}: ComponentProps & any) => {
  const { layout } = useTheme();
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [state, setState] = useDialogState(id);
  const { type, open, submitting, loading, showErrors } = state;
  const setShowErrors = React.useCallback(show => setState(prev => ({ ...prev, showErrors: show })), [setState]);
  const title = state.title ? state.title : Title;
  const fields = steps
    .filter(s => s.fields)
    .map(s => s.fields)
    .reduce((t, c) => (t = [...t, ...c]), []);

  const { values, setValues, hasChanged, errors, mapField } = useValues({
    open,
    fields,
    InitialValues,
    state,
    setState,
    validate,
  });

  // Re-initialize values when necessary
  React.useEffect(() => {
    open && setActiveStep(0);
    open && setConfirmDelete(false);
  }, [open]);

  const classes = useStyles({});
  const fullScreen = useFullScreen();

  const activeSteps = steps.filter(s => isEnabled(typeof s.enabled === 'function' ? s.enabled(values) : s.enabled));
  const currentStep = (activeSteps && activeSteps[activeStep]) || {};
  const stepValidate = currentStep.validate;

  const activeErrorCount = currentStep.fields ? currentStep.fields.filter(f => isError(f, values, errors)).length : 0;
  
  const values_s = JSON.stringify(values);
  const handleSubmit = React.useCallback(() => {
    if (activeErrorCount > 0) {
      setShowErrors(true);
    } else {
      onSubmit && onSubmit(JSON.parse(values_s));
    }
  }, [activeErrorCount, setShowErrors, onSubmit, values_s]);

  const handleDelete = React.useCallback(() => {
    onDelete && onDelete(JSON.parse(values_s));
  }, [onDelete, values_s]);

  const handleConfirmDelete = React.useCallback(() => setConfirmDelete(prev => !prev), [setConfirmDelete]);

  const handleClose = React.useCallback(() => {
    setState(prev => ({ ...prev, open: false }));
    onClose && onClose();
  }, [setState, onClose]);

  const handleNext = React.useCallback(() => {
    if (activeErrorCount > 0) {
      setShowErrors(true);
    } else {
      const next = (newValues = undefined) => {
        newValues && setValues(prev => merge(prev, newValues));
        showErrors && setShowErrors(false);
        setActiveStep(prevActiveStep => prevActiveStep + 1);
      };
      stepValidate ? stepValidate(JSON.parse(values_s), next) : next();
    }
  }, [setShowErrors, setValues, showErrors, stepValidate, setActiveStep, activeErrorCount, values_s]);

  const handleBack = React.useCallback(() => setActiveStep(prevActiveStep => prevActiveStep - 1), [setActiveStep]);

  const inProgress = loading || submitting;
  const disabled = inProgress || errors['loading'];

  return (
    <Dialog
      PaperComponent={!fullScreen && draggable ? PaperComponent : Paper}
      fullScreen={fullScreen}
      open={open}
      onClose={handleClose}
      aria-labelledby={`${id}-dialog-title`}
      aria-describedby={`${id}-dialog-description`}
      className={classes.dialog}
      disableAutoFocus={true}
      maxWidth={currentStep.maxWidth !== undefined ? currentStep.maxWidth : maxWidth}
      fullWidth
      {...other}
    >
      {title !== null && (
        <>
          <DialogTitle id={`${id}-dialog-title`} disableTypography className={classes.dialogTitle}>
            <Grid container justify='space-between' alignItems='center'>
              <Grid item>
                <Typography variant='h6' className={classes.capitalize}>
                  {title ? title : [type, id].join(' ')}
                </Typography>
              </Grid>
              <Grid item>
                <Tooltip title='Close' placement='left'>
                  <IconButton aria-label='close' className={classes.closeButton} onClick={handleClose}>
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </DialogTitle>
          <Divider />
          {!confirmDelete && (
            <DialogActions>
              <Grid container style={{ paddingLeft: 12, paddingRight: 12 }} alignItems='center'>
                <Grid item xs>
                  <Typography color='textSecondary'>{currentStep.label ? currentStep.label : currentStep.id}</Typography>
                </Grid>
                {activeSteps.length > 1 && (
                  <Grid item>
                    <Chip color='primary' label={`${activeStep + 1} of ${activeSteps.length}`} />
                  </Grid>
                )}
              </Grid>
            </DialogActions>
          )}
        </>
      )}
      <DialogContent dividers>
        <ErrorGate error={errors['loading']}>
          {inProgress && <CircularProgress size={layout.progressSize} className={classes.submitProgress} />}
          <Collapse in={!confirmDelete}>
            {activeSteps.map(({ fields = [], label, onActivate, minWidth }, i) => (
              <Collapse key={i} in={activeStep === i}>
                <Step key={label}>
                  <OnActivate
                    key={label}
                    index={i}
                    activeIndex={activeStep}
                    onActivate={onActivate}
                    values={values}
                    setValues={setValues}
                  >
                    <Grid container alignItems='center' spacing={1}>
                      <Fields fields={fields} mapField={mapField} values={values} />
                    </Grid>
                  </OnActivate>
                </Step>
              </Collapse>
            ))}
          </Collapse>
          {confirmDelete && (
            <Grid container spacing={2} justify='center' alignItems='center'>
              <Grid item>
                <Button onClick={handleConfirmDelete} color='secondary'>
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button onClick={handleDelete} className={classes.deleteButton}>
                  <DeleteIcon style={{ marginRight: 4 }} />
                  Confirm {deleteLabel}
                </Button>
              </Grid>
            </Grid>
          )}
        </ErrorGate>
      </DialogContent>
      {!confirmDelete && (
        <DialogActions className={classes.dialogActions}>
          <MobileStepper
            variant='dots'
            steps={activeSteps.length}
            position='static'
            activeStep={activeStep}
            className={classes.mobileStepper}
            nextButton={
              activeStep === activeSteps.length - 1 ? (
                <Button
                  color='primary'
                  size='small'
                  variant='contained'
                  disabled={!hasChanged || disabled}
                  onClick={handleSubmit}
                >
                  Finish
                  <CheckIcon style={{ marginLeft: 4 }} />
                </Button>
              ) : (
                <>
                  <Button size='small' onClick={handleNext} disabled={disabled}>
                    Next
                    <KeyboardArrowRight />
                  </Button>
                </>
              )
            }
            backButton={
              activeStep === 0 && type === 'Edit' && onDelete !== undefined ? (
                <Button
                  className={classes.deleteButton}
                  size='small'
                  variant='contained'
                  onClick={handleConfirmDelete}
                  disabled={disabled}
                >
                  <DeleteIcon style={{ marginRight: 4 }} />
                  {deleteLabel}
                </Button>
              ) : (
                <Button size='small' onClick={handleBack} disabled={activeStep === 0 || disabled}>
                  <KeyboardArrowLeft />
                  Back
                </Button>
              )
            }
          />
        </DialogActions>
      )}
    </Dialog>
  );
};

export default GenericStepperDialog;
