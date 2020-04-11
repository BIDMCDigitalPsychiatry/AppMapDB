import React from 'react';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import { TableFilterDialogButton, renderDialogModule } from '../../GenericDialog/DialogButton';
import * as FilterPopover from '../../GenericPopover/Filter';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';

import ViewModeButton from '../Applications/ViewModeButton';
import AppSummary from './AppSummary';
import { useAppData } from '../Applications/selectors';

const name = 'Applications';
const defaultProps: GenericTableContainerProps = {
  isList: true,
  name,
  dialogs: [renderDialogModule(RateNewAppDialog)],
  columns: [{ name: 'app', header: 'Application', Cell: AppSummary }],
  toolbar: true,
  footer: true,
  search: true,
  buttons: [<ViewModeButton />, <TableFilterDialogButton Module={FilterPopover} table={name} />]
};

export const ApplicationsList = props => <GenericTableContainer {...defaultProps} data={useAppData(name)} showScroll={true} {...props} />;
