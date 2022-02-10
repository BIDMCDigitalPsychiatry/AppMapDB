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
import { IconButton, Grid, Tooltip, CircularProgress, useTheme, Collapse } from '@material-ui/core';
import { useDialogState } from './useDialogState';
import Paper from '@material-ui/core/Paper';
import Draggable from 'react-draggable';
import { useValues } from './helpers';
import DeleteIcon from '@material-ui/icons/Delete';
import Fields from './Fields';
import ErrorGate from './ErrorGate';
import { useFullScreen } from '../../../hooks';
import { evalFunc } from '../../../helpers';

function PaperComponent(props) {
  return (
    <Draggable cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

const useStyles = makeStyles(({ spacing, palette, layout }: any) =>
  createStyles({
    button: {
      width: '100%',
      maxWidth: '200px'
    },
    dialog: {
      display: 'flex',
      flexDirection: 'column',
      outline: 'none',
      border: `5px solid ${palette.primary}`
    },
    dialogHeader: {
      background: palette.grey[100]
    },
    capitalize: {
      textTransform: 'capitalize'
    },
    content: {
      padding: spacing(2)
    },
    actions: {
      margin: 0,
      padding: spacing(1),
      paddingTop: spacing(0.5),
      paddingBottom: spacing(0.5)
    },
    title: {
      background: palette.primary.light,
      color: palette.common.white,
      margin: 0,
      padding: 0,
      paddingLeft: spacing(2),
      paddingRight: spacing(1)
    },
    closeButton: {
      color: 'inherit'
    },
    deleteButton: {
      color: palette.common.white,
      background: palette.error.main,
      '&:hover': {
        background: palette.error.dark
      }
    },
    deleteButtonEmpty: {
      color: palette.error.main
    },
    formControl: {
      marginTop: 8
    },
    submitProgress: {
      color: palette.primary.light,
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -(layout.progressSize / 2),
      marginLeft: -(layout.progressSize / 2)
    }
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
  OnClose: any;
  validate: any;
  Content: Element;
  ContentProps: any;
  fields: FieldProps[];
  classes?: object;
}

const GenericDialog = ({
  id,
  title: Title, // Title can be set via the state as well as the input props, state takes priority
  initialValues: InitialValues, // If initial values are provided they are merged with the initial values from the state
  draggable = false,
  cancelLabel = 'Cancel',
  deleteLabel = 'Delete',
  submitLabel,
  dialogActions = true,
  divider = true,
  fields = [] as any[],
  onSubmit,
  onDelete,
  onClose,
  loading: Loading = undefined,
  Content,
  ContentProps,
  validate,
  classes: Classes,
  children,
  ...other
}: ComponentProps & any) => {
  const { layout } = useTheme() as any;
  const [state, setState] = useDialogState(id);
  const { type, open, loading, submitting } = state;
  const title = state.title ? state.title : Title;

  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const handleConfirmDelete = React.useCallback(() => setConfirmDelete(prev => !prev), [setConfirmDelete]);

  const classes = useStyles({ classes: Classes });
  const fullScreen = useFullScreen();

  const { values, setValues, hasChanged, errors, errorCount, mapField } = useValues({
    open,
    fields,
    InitialValues,
    state,
    setState,
    validate
  });

  React.useEffect(() => {
    open && setConfirmDelete(false);
  }, [open]); // Re-initialize values when necessary

  const values_s = JSON.stringify(values);
  const handleSubmit = React.useCallback(() => {
    if (errorCount > 0) {
      setState(prev => ({ ...prev, showErrors: true }));
    } else {
      onSubmit && onSubmit(JSON.parse(values_s), setValues);
    }
  }, [setState, onSubmit, values_s, setValues, errorCount]);

  const handleDelete = React.useCallback(() => {
    onDelete && onDelete(JSON.parse(values_s));
  }, [onDelete, values_s]);

  const handleClose = React.useCallback(() => {
    setState(prev => ({ ...prev, open: false }));
    onClose && onClose();
  }, [setState, onClose]);

  const inProgress = loading || submitting || Loading;
  const disabled = inProgress || errors['loading'];

  const contentProps = {
    inProgress,
    disabled,
    fields,
    mapField,
    values,
    setValues,
    ...ContentProps
  };

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
      maxWidth='xs'
      fullWidth
      {...other}
    >
      {title !== null && (
        <>
          <DialogTitle id={`${id}-dialog-title`} disableTypography className={classes.title}>
            <Grid container justify='space-between' alignItems='center'>
              <Grid item zeroMinWidth xs>
                <Typography noWrap variant='h6' className={classes.capitalize}>
                  {title ? title : title === '' ? '' : [type, id].join(' ')}
                </Typography>
              </Grid>
              <Grid item>
                {handleClose ? (
                  <Tooltip title='Close' placement='left'>
                    <IconButton aria-label='close' className={classes.closeButton} onClick={handleClose}>
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                ) : null}
              </Grid>
            </Grid>
          </DialogTitle>
          {divider && <Divider />}
        </>
      )}
      <ErrorGate error={errors['loading']}>
        <>
          {children ? (
            children
          ) : Content ? (
            <Content {...contentProps} />
          ) : (
            <DialogContent className={classes.content} dividers>
              {inProgress && <CircularProgress size={layout.progressSize} className={classes.submitProgress} />}
              <Collapse in={!confirmDelete}>
                <Grid container alignItems='center' spacing={1}>
                  <Fields {...contentProps} />
                </Grid>
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
            </DialogContent>
          )}
        </>
      </ErrorGate>
      {dialogActions && !confirmDelete && (
        <DialogActions className={classes.actions}>
          {type?.toLowerCase() === 'edit' && onDelete !== undefined && (
            <Button disabled={disabled} className={classes.deleteButtonEmpty} onClick={handleConfirmDelete}>
              {deleteLabel}
            </Button>
          )}
          {cancelLabel !== null && (
            <Button color='default' onClick={handleClose}>
              {cancelLabel}
            </Button>
          )}
          {submitLabel !== null && (
            <Button autoFocus disabled={disabled || !hasChanged} color='primary' onClick={handleSubmit}>
              {evalFunc(submitLabel, values) || type}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default GenericDialog;
