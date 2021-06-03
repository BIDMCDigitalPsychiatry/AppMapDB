import React from 'react';
import type { FC } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Grid, makeStyles } from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import DialogButton from '../GenericDialog/DialogButton';
import * as EventDialog from '../GenericDialog/Event';
import { useUserId } from '../../layout/hooks';
import { uuid } from '../../../helpers';
import moment from 'moment';

interface HeaderProps {
  className?: string;
  onAddClick?: () => void;
}

const useStyles = makeStyles(theme => ({
  root: {},
  action: {
    marginBottom: theme.spacing(1),
    '& + &': {
      marginLeft: theme.spacing(1)
    }
  }
}));

const Header: FC<HeaderProps> = ({ className, onAddClick, ...rest }) => {
  const classes = useStyles();

  const userId = useUserId(); // Only instructors can currently create events, so grab the user id

  const initialValues = {
    id: uuid(),
    userId,
    start: moment().toDate(),
    end: moment().add(30, 'minutes').toDate(),
    frequency: 'Once',
    frequencyEnd: moment().add(1, 'months').toDate()
  };

  return (
    <Grid className={clsx(classes.root, className)} container justify='space-between' spacing={3} {...rest}>
      <Grid item xs style={{ textAlign: 'right' }}>
        <DialogButton Module={EventDialog} initialValues={initialValues} variant='outlined' size='large' mount={false} fullWidth Icon={Icons.Add}>
          New Event
        </DialogButton>
      </Grid>
    </Grid>
  );
};

Header.propTypes = {
  className: PropTypes.string,
  onAddClick: PropTypes.func
};

Header.defaultProps = {
  onAddClick: () => {}
};

export default Header;
