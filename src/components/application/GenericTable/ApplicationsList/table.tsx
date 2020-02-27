import React from 'react';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import * as selectors from '../Applications/selectors';
import * as Icons from '@material-ui/icons';
import DialogButton, { TableFilterDialogButton, renderDialogModule } from '../../GenericDialog/DialogButton';
import * as FilterPopover from '../../GenericPopover/Filter';
import * as GettingStartedDialog from '../../GenericDialog/GettingStarted';
import * as RateAppDialog from '../../GenericDialog/RateApp';
import * as AppReviewsDialog from '../../GenericDialog/AppReviews';
import ViewModeButton from '../Applications/ViewModeButton';
import AppSummary from './AppSummary';

const name = 'Applications';
const defaultProps: GenericTableContainerProps = {
  name,
  dialogs: [renderDialogModule(RateAppDialog), renderDialogModule(AppReviewsDialog)],
  columns: [{ name: 'app', header: 'Application', minWidth: 1300, Cell: AppSummary }],
  toolbar: true,
  selector: selectors.from_database,
  footer: true,
  search: true,
  includeHeaders: false,
  fixedRowCount: 0,
  rowHeight: 240,
  rowDivider: false,
  buttons: [
    <TableFilterDialogButton Module={FilterPopover} table={name} />,
    <ViewModeButton />,
    <DialogButton Module={GettingStartedDialog} Icon={Icons.Help} tooltip='Help Getting Started' />
  ]
};

export const ApplicationsList = props => <GenericTableContainer {...defaultProps} showScroll={true} {...props} />;
