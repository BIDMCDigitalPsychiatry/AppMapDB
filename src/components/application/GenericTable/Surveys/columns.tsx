import React from 'react';
import * as Icons from '@material-ui/icons';
import { Typography } from '@material-ui/core';
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

const RatedBy = (props = {}) => (
  <Typography variant='body2' color='textSecondary'>
    {props['What is your email address?']}
  </Typography>
);

const AppSummaryMapped = ({ app, ...other }) => <AppSummary {...app} {...other} />;

export const useColumns = () => {
  const columns = [
    { name: 'app', header: 'Application', minWidth: 300, Cell: AppSummaryMapped, hoverable: false, sort: 'textLower' },
    { name: 'What is your email address?', header: 'Submitted By', width: 240, Cell: RatedBy, hoverable: false, sort: 'textLower' },
    {
      name: 'updated',
      header: 'Last Updated',
      width: 225,
      Cell: LastUpdated,
      hoverable: false,
      sort: 'decimal'
    }
  ];

  return columns;
};
