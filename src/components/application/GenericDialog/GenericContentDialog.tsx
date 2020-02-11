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
import { useValues } from './helpers';
import DeleteIcon from '@material-ui/icons/Delete';
import ErrorGate from './ErrorGate';
import ExtendedButton from './ExtendedButton';
import * as Icons from '@material-ui/icons';
import FieldsTemplate from './FieldsTemplate';
import { useFullScreen } from '../../../hooks';

const useStyles = makeStyles(({ spacing, palette, layout }: any) =>
  createStyles({
    button: {
      width: '100%',
      maxWidth: '200px',
    },
    dialog: {
      display: 'flex',
      flexDirection: 'column',
      outline: 'none',
      border: `5px solid ${palette.primary}`,
    },
    dialogHeader: {
      background: palette.grey[100],
    },
    capitalize: {
      textTransform: 'capitalize',
    },
    dialogContent: {
      padding: spacing(2),
    },
    dialogActions: {
      margin: 0,
      padding: spacing(1),
      paddingTop: spacing(0.5),
      paddingBottom: spacing(0.5),
    },
    dialogTitle: {
      margin: 0,
      padding: 0,
    },
    dialogTitleGrid: {
      background: palette.primary.main,
      color: palette.common.white,
      paddingLeft: spacing(1.5),
      paddingRight: spacing(0),
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
    deleteButtonEmpty: {
      color: palette.error.main,
    },
    formControl: {
      marginTop: 8,
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
  dialogTitle: string;
  title: string;
  ContentSelector?: any;
  TabSelector?: any;
  initialValues?: object;
  modelNames?: string | string[];
  cancelLabel: string;
  deleteLabel: string;
  submitLabel: string;
  toolbarButtons?: any[];
  onSubmit: any;
  onDelete: any;
  OnClose: any;
  Template?: any;
  columns?: any;
  fullWidth?: boolean;
  minColumnWidth?: number;
  maxColumnWidth?: number;
  onApply?: (values) => any;
  validate: any;
  Content: Element;
  fields: FieldProps[];
}

const GenericDialogContent = ({
  id,
  dialogTitle,
  title,
  TabSelector,
  ContentSelector,
  initialValues: InitialValues, // If initial values are provided they are merged with the initial values from the state
  cancelLabel = 'Cancel',
  deleteLabel = 'Delete',
  submitLabel,
  toolbarButtons = [],
  modelNames = undefined,
  fields = [] as any[],
  Template = undefined,
  rounded = false,
  onSubmit,
  onDelete,
  onApply,
  onClose,
  Content,
  validate,
  columns,
  fullWidth,
  minColumnWidth,
  maxColumnWidth,
  maxContentWidth,
  children,
  ...other
}: ComponentProps & any) => {
  const { layout } = useTheme();
  const [state, setState] = useDialogState(id);
  const { type, open, loading, submitting } = state;

  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const handleConfirmDelete = React.useCallback(() => setConfirmDelete(prev => !prev), [setConfirmDelete]);

  const classes = useStyles({});
  const fullScreen = useFullScreen();

  const { values, hasChanged, errors, errorCount, mapField, initializeValues } = useValues({
    open,
    fields,
    InitialValues,
    state,
    setState,
    validate,
  });

  React.useEffect(() => {
    open && setConfirmDelete(false);
  }, [open]); // Re-initialize values when necessary

  const values_s = JSON.stringify(values);
  const handleSubmit = React.useCallback(() => {
    if (errorCount > 0) {
      setState(prev => ({ ...prev, showErrors: true }));
    } else {
      onSubmit && onSubmit(JSON.parse(values_s));
    }
  }, [setState, onSubmit, values_s, errorCount]);

  const handleDelete = React.useCallback(() => {
    onDelete && onDelete(JSON.parse(values_s));
  }, [onDelete, values_s]);

  const handleClose = React.useCallback(() => {
    setState(prev => ({ ...prev, open: false }));
    onClose && onClose();
  }, [setState, onClose]);

  const contentProps = {
    fields,
    columns,
    mapField,
    values,
    fullWidth,
    minColumnWidth,
    maxColumnWidth,
    Template,
  };

  const inProgress = loading || submitting;
  const disabled = inProgress || errors['loading'];

  const handleApply = () => onApply && onApply(values);

  const handleRevert = React.useCallback(() => {
    initializeValues();
  }, [initializeValues]);

  const revertButton = (
    <ExtendedButton
      key='revert'
      onClick={handleRevert}
      Icon={Icons.Cancel}
      text='Revert'
      tooltip='Click to Revert Changes'
      placement='bottom'
      disabled={!hasChanged || inProgress}
    />
  );

  const applyButton = (
    <ExtendedButton
      key='apply'
      onClick={handleApply}
      Icon={Icons.Check}
      text='Apply'
      tooltip='Click to Apply Changes'
      placement='bottom'
      disabled={errorCount > 0 || !hasChanged || inProgress}
    />
  );

  const minHeight = TabSelector ? 720 - layout.tabletoolbarheight - layout.contentrowspacing : 720;

  return (
    <Dialog
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
      {dialogTitle !== null && (
        <>
          <DialogTitle id={`${id}-dialog-title`} disableTypography className={classes.dialogTitle}>
            <Grid container className={classes.dialogTitleGrid} justify='space-between' alignItems='center'>
              <Grid item>
                <Typography variant='h6' className={classes.capitalize}>
                  {dialogTitle ? dialogTitle : [type, id].join(' ')}
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
          <Divider />
        </>
      )}
      <ErrorGate error={errors['loading']}>
        <DialogContent className={classes.dialogContent} dividers>
          <div style={{ minHeight }}>
            {inProgress && <CircularProgress size={layout.progressSize} className={classes.submitProgress} />}
            <Collapse in={!confirmDelete}>
              <Grid container alignItems='center' justify='center'>
                <Grid item xs={12} style={{ maxWidth: maxContentWidth }}>
                  <Grid container alignItems='center' spacing={1}>
                    <FieldsTemplate {...contentProps} />
                  </Grid>
                </Grid>
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
          </div>
        </DialogContent>
      </ErrorGate>
      {!confirmDelete && (
        <DialogActions className={classes.dialogActions}>
          {type === 'Edit' && onDelete !== undefined && (
            <Button disabled={disabled} className={classes.deleteButtonEmpty} onClick={handleConfirmDelete}>
              {deleteLabel}
            </Button>
          )}
          {cancelLabel !== null && (
            <Button color='secondary' onClick={handleClose}>
              {cancelLabel}
            </Button>
          )}
          {submitLabel !== null && (
            <Button autoFocus disabled={disabled || !hasChanged} color='primary' onClick={handleSubmit}>
              {submitLabel || type}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default GenericDialogContent;
