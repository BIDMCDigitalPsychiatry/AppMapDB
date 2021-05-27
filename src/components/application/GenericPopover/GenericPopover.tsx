import React from 'react';
import {
  Card,
  Popover,
  useTheme,
  makeStyles,
  createStyles,
  CardContent,
  Divider,
  CardActions,
  Button,
  Grid,
  Tooltip,
  IconButton,
  CircularProgress,
  Collapse,
  CardHeader
} from '@material-ui/core';
import { useDialogState } from '../GenericDialog/useDialogState';
import { useValues, FieldProps } from '../GenericDialog/helpers';
import ErrorGate from '../GenericDialog/ErrorGate';
import * as Icons from '@material-ui/icons';
import Fields from '../GenericDialog/Fields';

export interface ComponentProps {
  id: string;
  title?: string;
  anchorEl?: any;
  initialValues?: object;
  cancelLabel?: string;
  deleteLabel?: string;
  submitLabel?: string;
  onSubmit?: any;
  onDelete?: any;
  onReset?: any;
  OnClose?: any;
  validate?: any;
  Content?: any;
  values?: any;
  width?: number | string;
  columns?: number;
  minColumnWidth?: number;
  maxColumnWidth?: number;
  setValues?: any;
  disableInitialize?: boolean;
  fields?: FieldProps[] | any;
  onClose?: () => any;
  children?: any;
}

const useStyles = makeStyles(({ spacing, palette, layout }: any) =>
  createStyles({
    title: {
      fontSize: 14,
      padding: spacing(1),
      paddingLeft: spacing(2),
      paddingRight: spacing(1)
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
    submitProgress: {
      color: palette.primary.light,
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -(layout.progressSize / 2),
      marginLeft: -(layout.progressSize / 2)
    },
    card: ({ width = 290 }: any) => ({
      width
    })
  })
);

export default function GenericPopover({
  id,
  title: Title, // Title can be set via the state as well as the input props, state takes priority
  anchorEl,
  initialValues: InitialValues, // If initial values are provided they are merged with the initial values from the state
  cancelLabel = 'Cancel',
  deleteLabel = 'Delete',
  submitLabel = 'Submit',
  fields = [] as any[],
  width,
  onSubmit,
  onDelete,
  onClose,
  onReset,
  Content,
  validate,
  columns,
  minColumnWidth,
  maxColumnWidth,
  values: externalValues = undefined,
  setValues: externalSetValues = undefined,
  disableInitialize = false,
  children,
  ...other
}: ComponentProps) {
  const { layout } = useTheme() as any;
  const [state, setState] = useDialogState(id);
  const { open, type, loading, submitting } = state;
  const title = state.title ? state.title : Title;

  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const handleConfirmDelete = React.useCallback(() => setConfirmDelete(prev => !prev), [setConfirmDelete]);

  const classes = useStyles({ width });

  const { values, hasChanged, errors, errorCount, mapField } = useValues({
    open,
    fields,
    InitialValues,
    state,
    setState,
    validate,
    externalSetValues,
    externalValues,
    disableInitialize
  });

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

  const handleReset = React.useCallback(() => {
    onReset && onReset();
  }, [onReset]);

  const contentProps = {
    fields,
    mapField,
    values,
    columns,
    minColumnWidth,
    maxColumnWidth
  };

  const inProgress = loading || submitting;
  const disabled = inProgress || errors['loading'];

  return (
    <Popover
      id={id}
      open={open && Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      {...other}
    >
      <Card className={classes.card}>
        {title !== null && (
          <>
            <CardHeader
              className={classes.title}
              title={title ? title : id}
              action={
                handleClose && (
                  <Tooltip title='Close' placement='left'>
                    <IconButton aria-label='close' onClick={handleClose}>
                      <Icons.Close />
                    </IconButton>
                  </Tooltip>
                )
              }
            />
            <Divider />
          </>
        )}
        <CardContent>
          <ErrorGate error={errors['loading']}>
            <>
              {children ? (
                children
              ) : Content ? (
                <Content {...contentProps} />
              ) : (
                <>
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
                          <Icons.Delete style={{ marginRight: 4 }} />
                          Confirm {deleteLabel}
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </>
              )}
            </>
          </ErrorGate>
        </CardContent>
        <Divider />
        <CardActions>
          <Button size='small' color='default' onClick={handleReset}>
            Reset
          </Button>
          {type === 'Edit' && onDelete !== undefined && (
            <Button size='small' disabled={disabled} className={classes.deleteButtonEmpty} onClick={handleConfirmDelete}>
              {deleteLabel}
            </Button>
          )}
          {cancelLabel !== null && (
            <Button size='small' color='default' onClick={handleClose}>
              {cancelLabel}
            </Button>
          )}
          {submitLabel !== null && (
            <Button autoFocus size='small' disabled={disabled || !hasChanged} color='primary' onClick={handleSubmit}>
              {submitLabel || type}
            </Button>
          )}
        </CardActions>
      </Card>
    </Popover>
  );
}
