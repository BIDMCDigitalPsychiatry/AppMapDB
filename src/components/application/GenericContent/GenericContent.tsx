import React from 'react';
import { useTheme, Button, Grid, CircularProgress, Collapse, Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import { useDialogState } from '../GenericDialog/useDialogState';
import { useValues, FieldProps } from '../GenericDialog/helpers';
import ErrorGate from '../GenericDialog/ErrorGate';
import Fields from '../GenericDialog/Fields';

export interface ComponentProps {
  id: string;
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
  Buttons?: any;
}

const useStyles = makeStyles(({ palette, layout }: any) =>
  createStyles({
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

export default function GenericContent({
  id,
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
  disableInitialize = undefined,
  Buttons,
  children,
  ...other
}: ComponentProps) {
  const { layout } = useTheme() as any;
  const [state, setState] = useDialogState(id);
  const { open, type, loading, submitting } = state;

  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const handleConfirmDelete = React.useCallback(() => setConfirmDelete(prev => !prev), [setConfirmDelete]);

  const classes = useStyles({ width });

  const { values, setValues, errors, mapField } = useValues({
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

  const handleReset = React.useCallback(() => setValues({}), [setValues]);

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
    <>
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
            </>
          )}
        </>
      </ErrorGate>
      <Box mt={2} />
      {Buttons ? (
        <Buttons {...other} values={values} setValues={setValues} handleReset={handleReset} />
      ) : (
        type === 'Edit' &&
        onDelete !== undefined && (
          <Button size='small' disabled={disabled} className={classes.deleteButtonEmpty} onClick={handleConfirmDelete}>
            {deleteLabel}
          </Button>
        )
      )}
    </>
  );
}
