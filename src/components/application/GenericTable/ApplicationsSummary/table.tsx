import React from 'react';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import { renderDialogModule } from '../../GenericDialog/DialogButton';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import ViewModeButton from '../Applications/ViewModeButton';
import ApplicationSummary from './ApplicationSummary';
import { useAppData } from '../Applications/selectors';
import AdminToggle from '../Applications/AdminToggle';
import * as FilterPopover from '../../GenericPopover/Filter';
import FilterButton from '../Applications/FilterButton';

const name = 'Applications';
export const defaultApplicationsSummaryProps: GenericTableContainerProps = {
  isList: true,
  name,
  dialogs: [renderDialogModule(RateNewAppDialog)],
  columns: [{ name: 'app', header: 'Application', Cell: ApplicationSummary }],
  toolbar: false,
  footer: true,
  search: false
};

export const ApplicationsSummary = props => (
  <>
    <FilterButton Module={FilterPopover} table={name} />
    <AdminToggle />
    <ViewModeButton />
    <GenericTableContainer {...defaultApplicationsSummaryProps} data={useAppData(name)} showScroll={true} {...props} />
  </>
);
