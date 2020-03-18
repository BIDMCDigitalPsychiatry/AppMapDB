﻿import React from 'react';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import * as selectors from '../Applications/selectors';
import { TableFilterDialogButton, renderDialogModule } from '../../GenericDialog/DialogButton';
import * as FilterPopover from '../../GenericPopover/Filter';
import * as RateAppDialog from '../../GenericDialog/RateApp';
import * as AppReviewsDialog from '../../GenericDialog/AppReviews';
import ViewModeButton from '../Applications/ViewModeButton';
import AppSummary from './AppSummary';

const name = 'Applications';
const defaultProps: GenericTableContainerProps = {
  isList: true,
  name,
  dialogs: [renderDialogModule(RateAppDialog), renderDialogModule(AppReviewsDialog)],
  columns: [{ name: 'app', header: 'Application', Cell: AppSummary }],
  toolbar: true,
  selector: selectors.from_database,
  footer: true,
  search: true,
  buttons: [
    <ViewModeButton />,
    <TableFilterDialogButton Module={FilterPopover} table={name} />
    //<DialogButton Module={GettingStartedDialog} Icon={Icons.Help} tooltip='Help Getting Started' />
  ]
};

export const ApplicationsList = props => <GenericTableContainer {...defaultProps} showScroll={true} {...props} />;
