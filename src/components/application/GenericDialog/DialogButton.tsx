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
} from '@material-ui/core';
import { useDialogState } from './actions';
import EditIcon from '@material-ui/icons/Edit';
import { checkEmpty, evalFunc } from '../../../helpers';

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
}) => (
  <DialogButton
    variant={variant}
    Icon={EditIcon}
    type='Edit'
    tooltip={tooltip}
    placement={placement}
    mount={mount}
    {...other}
  />
);

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
        background: palette.primary.main,
      },
    },
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
  children,
  ...other
}: DialogButtonProps & any) {
  const classes = useStyles({});
  const theme = useTheme();
  const id = Id ? Id : Module && Module.title;
  const [, setDialogState] = useDialogState(id);

  const other_s = JSON.stringify(other);
  const handleUpdate = React.useCallback(() => {
    setDialogState({
      type,
      open: true,
      initialValues: evalFunc(initialValues),
      ...JSON.parse(other_s),
    });
  }, [setDialogState, other_s, initialValues, type]);

  const handleClose = React.useCallback(() => {
    onClose && onClose();
  }, [onClose]);

  const handleClick = React.useCallback(
    event => {
      onClick && onClick(event);
      handleUpdate();
    },
    [onClick, handleUpdate]
  );

  const shared = {
    disabled,
    onClick: handleClick,
    size,
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
      {mount && Module && renderDialogModule({ ...Module, onClose: handleClose })}
      <Tooltip
        placement={placement}
        title={
          checkEmpty(tooltip) ? (
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
                height: 48,
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
          ) : (
            <Fab
              size={size}
              variant='extended'
              color='primary'
              style={{
                color: disabled ? theme.palette.primary.light : theme.palette.common.white,
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
