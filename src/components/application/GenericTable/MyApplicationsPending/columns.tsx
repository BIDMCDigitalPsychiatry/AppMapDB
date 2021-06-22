import React from 'react';
import * as Icons from '@material-ui/icons';
import MyRatingsColumnPending from './MyRatingsColumnPending';
import { Chip, createStyles, makeStyles, Typography } from '@material-ui/core';
import { getDayTimeFromTimestamp } from '../../../../helpers';
import AppSummary from '../Applications/AppSummary';
import { green, orange, red, yellow } from '@material-ui/core/colors';

export const name = 'Applications';
const center = text => <div style={{ textAlign: 'center' }}>{text}</div>;

export const CenterRadio = ({ checked = false }) => {
  const Icon = checked ? Icons.RadioButtonChecked : Icons.RadioButtonUnchecked;
  return center(<Icon color='action' fontSize='small' />);
};

const LastUpdated = ({ updated }) => (
  <Typography variant='body2' color='textSecondary'>
    {updated ? getDayTimeFromTimestamp(updated) : ''}
  </Typography>
);

const RatedBy = ({ email }) => (
  <Typography variant='body2' color='textSecondary'>
    {email}
  </Typography>
);

const width = 128;

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    archived: {
      width,
      color: palette.common.white,
      backgroundColor: red[600]
    },
    approved: {
      width,
      color: palette.common.white,
      backgroundColor: green[600]
    },
    pending: {
      width,
      color: palette.common.white,
      backgroundColor: orange[700]
    },
    draft: {
      width,
      color: palette.text.primary, //palette.common.black,
      backgroundColor: yellow[100]
    }
  })
);

export const Status = props => {
  const { draft, approved } = props;
  const classes = useStyles();
  const label = props.delete ? 'Archived' : draft ? 'Draft' : approved ? 'Approved' : 'Pending Approval';
  return (
    <Chip
      className={props.delete ? classes.archived : draft ? classes.draft : approved ? classes.approved : classes.pending}
      label={label}
      variant='outlined'
    />
  );
};

const MyRatingsColumn = props => {
  return <MyRatingsColumnPending {...props} showRatings={true} showInfo={false} canEdit={true /*props?.approved ? false : true*/} />;
};

export const useColumns = () => {
  const columns = [
    { name: 'app', header: 'Application', minWidth: 300, Cell: AppSummary, hoverable: false, sort: 'textLower' },
    { name: 'email', header: 'Rated By', width: 240, Cell: RatedBy, hoverable: false, sort: 'textLower' },
    { name: 'updated', header: 'Last Updated', width: 225, Cell: LastUpdated, hoverable: false, sort: 'decimal' },
    { name: 'status', header: 'Status', width: 148, Cell: Status, hoverable: false },
    { name: 'rating', header: 'Rating', width: 120, Cell: MyRatingsColumn, hoverable: false }
  ];

  return columns;
};
