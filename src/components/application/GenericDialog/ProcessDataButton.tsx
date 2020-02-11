import React from 'react';
import ExtendedButton from './ExtendedButton';
import { useProcessDataHandle } from '../../../database/useProcessData';

const ProcessDataButton = ({ pdis, ...other }) => {
  const handleProcessData = useProcessDataHandle();
  return <ExtendedButton onClick={handleProcessData(typeof pdis === 'function' ? pdis() : pdis)} {...other} />;
};

export default ProcessDataButton;
