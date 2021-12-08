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
  Link,
  MenuItem
} from '@material-ui/core';
import { useDialogState } from './useDialogState';
import EditIcon from '@material-ui/icons/Edit';
import { checkEmpty, evalFunc } from '../../../helpers';
import { useTableFilterValues } from '../GenericTable/store';
import * as Icons from '@material-ui/icons';
import { useFullScreen } from '../../../hooks';
import ArrowButton from '../../general/ArrowButton';

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

const useStyles = makeStyles(({ palette, spacing }: any) =>
  createStyles({
    margin: {
      margin: spacing(1)
    },
    listitem: {
      padding: 8,
      paddingLeft: 16,
      paddingRight: 8,
      background: 'inherit',
      '&:hover': {
        color: palette.common.white,
        background: palette.primary.main
      }
    },
    primaryButton: {
      borderRadius: 7,
      fontSize: 16,
      fontWeight: 700,
      color: palette.common.white,
      background: palette.primary.dark,
      minWidth: 160,
      height: 40,
      '&:hover': {
        background: palette.primary.main
      }
    },
    primaryButton2: {
      borderRadius: 7,
      color: palette.common.white,
      background: palette.primary.dark,
      '&:hover': {
        background: palette.primary.main
      }
    }
  })
);

const DialogButton = React.forwardRef(function DialogButton(
  {
    id: Id = undefined,
    Module = undefined,
    type = 'Add',
    tooltip = '',
    placement = 'bottom',
    color = 'primary',
    variant = 'fab',
    underline = 'hover',
    linkvariant = 'caption',
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
    className = undefined,
    disabledColor = undefined,
    fullWidth = true,
    style = undefined,
    children,
    ...other
  }: DialogButtonProps & any,
  ref
) {
  const classes = useStyles({});
  const theme = useTheme();
  const fullScreen = useFullScreen();
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
    size,
    className
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
          {variant === 'default' ? (
            <Button {...shared} color={color}>
              {children}
            </Button>
          ) : variant === 'arrowButton' ? (
            <ArrowButton label={label} {...shared} size='normal' />
          ) : variant === 'primaryButton' ? (
            <Button {...shared} className={classes.primaryButton} fullWidth={fullWidth} style={style}>
              {children}
            </Button>
          ) : variant === 'primaryButton2' ? (
            <Button {...shared} className={classes.primaryButton2} fullWidth={fullWidth} style={style}>
              {children}
            </Button>
          ) : variant === 'menuitem' ? (
            <MenuItem key={label} {...shared}>
              {children}
            </MenuItem>
          ) : variant === 'listitem' ? (
            <ListItem key={label} button={true} className={classes.listitem} {...shared}>
              <ListItemText primary={label} />
            </ListItem>
          ) : variant === 'iconbutton' ? (
            <IconButton className={classes.margin} color={color} {...shared}>
              {Icon && <Icon fontSize='large' />}
            </IconButton>
          ) : variant === 'primarycontained' ? (
            <Button color='primary' variant='contained' {...shared}>
              {children}
            </Button>
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
            <Button fullWidth={fullWidth} variant={variant} color={color as any} {...shared} style={style}>
              {children}
            </Button>
          ) : variant === 'smallOutlined' ? (
            <Button size='small' variant='outlined' style={{ width: 96 }} {...shared}>
              {children}
            </Button>
          ) : variant === 'outlined' ? (
            <Button variant='outlined' color={color} startIcon={Icon && <Icon />} {...shared}>
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
              <Link color={color} variant={linkvariant} underline={underline} style={{ cursor: 'pointer' }} {...shared}>
                {children}
              </Link>
            )
          ) : (
            <Fab
              size={size}
              variant='extended'
              color={color}
              style={{
                color: disabled ? (disabledColor ? disabledColor : theme.palette.primary.light) : theme.palette.common.white
              }}
              {...shared}
            >
              {Icon && <Icon />}
              {children && <div style={{ marginLeft: Icon ? 4 : 0, marginRight: !fullScreen ? 4 : 0 }}>{children}</div>}
            </Fab>
          )}
        </span>
      </Tooltip>
    </>
  );
});

export default DialogButton;
