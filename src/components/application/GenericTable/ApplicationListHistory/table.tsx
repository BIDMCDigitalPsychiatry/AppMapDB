import React from 'react';
import GenericTableContainer from '../GenericTableContainer';
import { defaultApplicationsListProps } from '../ApplicationsList/table';
import { useAppHistoryData } from '../ApplicationHistory/selectors';

const name = 'Application History';

export const ApplicationListHistory = ({ initialValues, ...props }) => {
  const _id = initialValues?.applications?._id;
  return <GenericTableContainer {...defaultApplicationsListProps} name={name} data={useAppHistoryData(name, _id)} showScroll={true} {...props} />;
};
