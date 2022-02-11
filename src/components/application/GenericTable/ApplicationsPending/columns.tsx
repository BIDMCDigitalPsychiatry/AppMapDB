import React from 'react';
import * as Icons from '@mui/icons-material';
import RatingsColumnPending from './RatingsColumnPending';
import { Typography } from '@mui/material';
import { getDayTimeFromTimestamp } from '../../../../helpers';
import AppSummary from '../Applications/AppSummary';

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

export const useColumns = ({ email }) => {
  const columns = [
    { name: 'app', header: 'Application', minWidth: 300, Cell: AppSummary, hoverable: false, sort: 'textLower' },
    { name: 'email', header: 'Rated By', width: 240, Cell: RatedBy, hoverable: false, sort: 'textLower' },
    {
      name: 'updated',
      header: 'Last Updated',
      width: 225,
      Cell: LastUpdated,
      hoverable: false,
      sort: 'decimal'
    },
    { name: 'rating', header: 'Rating', width: 180, Cell: RatingsColumnPending, hoverable: false }
  ];

  return columns;
};
