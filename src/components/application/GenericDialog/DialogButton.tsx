import React from 'react';
import AddIcon from '@material-ui/icons/Add';
import {
  Button,
  IconButton,
  Tooltip,
  Grid,
  Typography,
  Fab,
  useTheme,
  ListItem,
  ListItemText,
  makeStyles,
  createStyles,
  Badge,
  withStyles,
  Link
} from '@material-ui/core';
import { useDialogState } from './useDialogState';
import EditIcon from '@material-ui/icons/Edit';
import { checkEmpty, evalFunc } from '../../../helpers';
import { useTableFilterValues } from '../GenericTable/store';
import * as Icons from '@material-ui/icons';
import { useFullScreen } from '../../../hooks';

export interface DialogModuleProps {
  default: any;
  title: string;
  props?: any;
}

export const renderDialogModule = ({ default: Dialog, title, ...props }) => Dialog && <Dialog id={title} {...props} />;

export const EditDialogButton = ({
  variant = 'iconbutton',
  placement = 'left',
  tooltip = 'Edit',
  mount = false, // Default to false, as most edit buttons are within the table rows, which get remounted in various scenaries (layout resizing etc)
  ...other
}) => <DialogButton variant={variant} Icon={EditIcon} type='Edit' tooltip={tooltip} placement={placement} mount={mount} {...other} />;

const StyledBadge = withStyles(theme =>
  createStyles({
    badge: {
      top: 7,
      right: 6,
      border: `1px solid ${theme.palette.background.paper}`
    }
  })
)(Badge);

export const TableFilterDialogButton = ({ table, Module, Icon = Icons.FilterList, tooltip = 'Filter Results' }) => {
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
    'Clinical Foundation': ClinicalFoundation,
    'Developer Type': DeveloperType,
    correctContent
  } = values as any;
  const filterCount =
    [Features, Engagements, Inputs, Outputs, Functionalities, Conditions, Platforms, Cost, Privacy, Uses].reduce((t, c) => (t = t + c.length), 0) +
    [ClinicalFoundation, DeveloperType, correctContent].reduce((t, c) => (t = t + (checkEmpty(c) ? 0 : 1)), 0);

  const handleReset = React.useCallback(() => setValues({}), [setValues]);
  const fullScreen = useFullScreen();

  return (
    <StyledBadge badgeContent={filterCount} color='error' overlap='circle' anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
      <DialogButton
        Module={Module}
        Icon={Icon}
        tooltip={filterCount === 0 ? tooltip : `${filterCount} Filters Active`}
        table={table}
        values={values}
        setValues={setValues}
        onReset={handleReset}
      >
        {!fullScreen && 'Filter'}
      </DialogButton>
    </StyledBadge>
  );
};

// Pass a dialog via Module.  If dialog is mounted elsewhere, set mounted = false to prevent duplicate mounts
export interface DialogButtonProps {
  id?: string;
  Module?: DialogModuleProps;
  type?: 'Add' | 'Edit' | 'View';
  tooltip?: string;
  placement?: any;
  color?: any;
  variant?: string;
  Icon?: any;
  initialValues?: object;
  children?: any;
}

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    listitem: {
      padding: 8,
      paddingLeft: 16,
      paddingRight: 8,
      background: 'inherit',
      '&:hover': {
        color: palette.common.white,
        background: palette.primary.main
      }
    }
  })
);

export default function DialogButton({
  id: Id = undefined,
  Module = undefined,
  type = 'Add',
  tooltip = 'Add',
  placement = 'bottom',
  color = 'primary',
  variant = 'fab',
  size = 'small',
  label = '',
  disabled = undefined,
  Icon = AddIcon,
  initialValues = {},
  noGrid = true,
  mount = true,
  onClick = undefined,
  onClose = undefined,
  onChange = undefined,
  onReset = undefined,
  values = undefined,
  setValues = undefined,
  children,
  ...other
}: DialogButtonProps & any) {
  const classes = useStyles({});
  const theme = useTheme();
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

  const shared = {
    disabled,
    onClick: handleClick,
    size
  };

  const wrapGrid = Content =>
    !noGrid ? (
      <Grid key={tooltip} item>
        {Content}
      </Grid>
    ) : (
      Content
    );

  return wrapGrid(
    <>
      {mount && Module && renderDialogModule({ ...Module, anchorEl, onClose: handleClose, onChange, onReset, values, setValues })}
      <Tooltip
        placement={placement}
        title={
          disabled ? (
            ''
          ) : checkEmpty(tooltip) ? (
            tooltip
          ) : (
            <Typography variant='h6' color='inherit'>
              {tooltip}
            </Typography>
          )
        }
      >
        <span>
          {variant === 'listitem' ? (
            <ListItem key={label} button={true} className={classes.listitem} {...shared}>
              <ListItemText primary={label} />
            </ListItem>
          ) : variant === 'iconbutton' ? (
            <IconButton color='inherit' {...shared}>
              {Icon && <Icon />}
            </IconButton>
          ) : variant === 'text' ? (
            <Button
              color='secondary'
              style={{
                width: 48,
                height: 48
              }}
              variant={variant}
              {...shared}
            >
              {Icon && <Icon style={{ margin: -4 }} />}
            </Button>
          ) : variant === 'contained' ? (
            <Button fullWidth={true} variant={variant} color={color as any} {...shared}>
              {children}
            </Button>
          ) : variant === 'standard' ? (
            <Button color={color as any} {...shared}>
              {children}
            </Button>
          ) : variant === 'link' ? (
            disabled ? (
              <Typography color='textSecondary' variant='caption'>
                {children}
              </Typography>
            ) : (
              <Link color={color} variant='caption' style={{ cursor: 'pointer' }} {...shared}>
                {children}
              </Link>
            )
          ) : (
            <Fab
              size={size}
              variant='extended'
              color='primary'
              style={{
                color: disabled ? theme.palette.primary.light : theme.palette.common.white
              }}
              {...shared}
            >
              {Icon && <Icon style={{ margin: -4 }} />}
              {children && <div style={{ marginLeft: Icon ? 8 : 0 }}>{children}</div>}
            </Fab>
          )}
        </span>
      </Tooltip>
    </>
  );
}
