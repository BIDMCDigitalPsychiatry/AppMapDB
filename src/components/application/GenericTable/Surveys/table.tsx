import React from 'react';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import { useColumns } from './columns';
import { useSurveyData } from './selectors';

export const name = 'Surveys';

export const defaultApplicationsProps: GenericTableContainerProps = {
  name,
  dialogs: [],
  toolbar: false,
  footer: true,
  search: false
};

export const Surveys = props => {
  const columns = useColumns();
  const data = useSurveyData(name);
  return <GenericTableContainer {...defaultApplicationsProps} data={data} columns={columns} showScroll={true} {...props} />;
};
