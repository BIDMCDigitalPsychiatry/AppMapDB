import React from 'react';
import * as Icons from '@mui/icons-material';
import { Badge, Fab } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import { useTableFilterValues } from '../store';
import { useDialogState } from '../../GenericDialog/useDialogState';
import { evalFunc } from '../../../../helpers';
import { renderDialogModule } from '../../GenericDialog/DialogButton';

const useStyles = makeStyles(({ spacing }: any) =>
  createStyles({
    fab: {
      position: 'absolute',
      bottom: spacing(17),
      right: spacing(3),
      zIndex: 999999
    }
  })
);

const StyledBadge = withStyles(theme =>
  createStyles({
    badge: {
      top: -5,
      right: 6,
      border: `1px solid ${theme.palette.background.paper}`
    }
  })
)(Badge);

export default function FilterButton({
  id: Id = undefined,
  type = 'Add',
  table,
  Module,
  Icon = Icons.FilterList,
  tooltip: Tooltip = 'Filter Results',
  onClick = undefined,
  onClose = undefined,
  onChange = undefined,
  onReset = undefined,
  mount = true,
  initialValues = {},
  ...other
}) {
  const classes = useStyles();
  const [values, setValues] = useTableFilterValues(table);
  const {
    Features = [],
    Engagements = [],
    Inputs = [],
    Outputs = [],
    Functionalities = [],
    Conditions = [],
    Platforms = [],
    Cost = [],
    Privacy = [],
    Uses = [],
    DeveloperTypes = [],
    ClinicalFoundations = []
  } = values as any;
  const filterCount = [
    Features,
    Engagements,
    Inputs,
    Outputs,
    Functionalities,
    Conditions,
    Platforms,
    Cost,
    Privacy,
    Uses,
    DeveloperTypes,
    ClinicalFoundations
  ].reduce((t, c) => (t = t + c.length), 0);
  const id = Id ? Id : Module && Module.title;
  const [, setDialogState] = useDialogState(id);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const other_s = JSON.stringify(other);
  const handleUpdate = React.useCallback(() => {
    setDialogState({
      type,
      open: true,
      initialValues: evalFunc(initialValues),
      ...JSON.parse(other_s)
    });
  }, [setDialogState, other_s, initialValues, type]);

  const handleClose = React.useCallback(() => {
    setAnchorEl(null);
    onClose && onClose();
  }, [onClose, setAnchorEl]);

  const handleClick = React.useCallback(
    event => {
      setAnchorEl(event.currentTarget);
      onClick && onClick(event);
      handleUpdate();
    },
    [onClick, handleUpdate]
  );

  const handleReset = React.useCallback(() => setValues({}), [setValues]);
  return (
    <>
      {mount && Module && renderDialogModule({ ...Module, anchorEl, onClose: handleClose, onChange, onReset: handleReset, values, setValues })}
      <div className={classes.fab}>
        <StyledBadge badgeContent={filterCount} color='error' overlap='circular' anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
          <Fab size='large' color='primary' aria-label='view-mode' onClick={handleClick}>
            <Icon />
          </Fab>
        </StyledBadge>
      </div>
    </>
  );
}
