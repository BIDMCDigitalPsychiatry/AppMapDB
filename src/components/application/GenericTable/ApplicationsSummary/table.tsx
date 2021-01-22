import React from 'react';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import { renderDialogModule } from '../../GenericDialog/DialogButton';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import ApplicationSummary from './ApplicationSummary';
import { useAppData } from '../Applications/selectors';

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
    <GenericTableContainer {...defaultApplicationsSummaryProps} data={useAppData(name)} showScroll={true} {...props} />
  </>
);
