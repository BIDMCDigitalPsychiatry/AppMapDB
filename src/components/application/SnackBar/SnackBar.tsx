import * as React from 'react';
import clsx from 'clsx';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import { amber, green } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import WarningIcon from '@mui/icons-material/Warning';
import { useSnackBar } from './useSnackBar';
import { makeStyles } from '@mui/styles';

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon
};

const useStyles = makeStyles(theme => ({
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: theme.palette.error.dark
  },
  info: {
    backgroundColor: theme.palette.primary.main
  },
  warning: {
    backgroundColor: amber[700]
  },
  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1)
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  }
}));

export default function SnackBar({ className = undefined, ...other }) {
  const classes = useStyles();
  const [{ open, message, variant = 'success' }, setSnackBar] = useSnackBar();
  const handleClose = React.useCallback((event, reason) => reason !== 'clickaway' && setSnackBar({ open: false }), [setSnackBar]);
  const Icon = variantIcon[variant];
  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
    >
      <SnackbarContent
        className={clsx(classes[variant], className)}
        aria-describedby='client-snackbar'
        message={
          <span id='client-snackbar' className={classes.message}>
            <Icon className={clsx(classes.icon, classes.iconVariant)} />
            {message}
          </span>
        }
        action={[
          <IconButton key='close' aria-label='close' color='inherit' onClick={handleClose as any} size='large'>
            <CloseIcon className={classes.icon} />
          </IconButton>
        ]}
        {...other}
      />
    </Snackbar>
  );
}
