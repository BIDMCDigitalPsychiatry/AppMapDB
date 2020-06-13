import React from 'react';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import AppReview from './AppReview';
import { useAppReviewData } from './useAppReviewData';

const name = 'Reviews';
export const defaultAppReviewProps: GenericTableContainerProps = {
  isList: true,
  name,
  columns: [{ name: 'appreview', header: 'Application Review', Cell: AppReview }],
  toolbar: false,
  footer: true,
  search: false
};

export const ApplicationReviews = ({ groupId, ...other }) => (
  <GenericTableContainer {...defaultAppReviewProps} data={useAppReviewData(name, groupId)} showScroll={true} {...other} />
);
