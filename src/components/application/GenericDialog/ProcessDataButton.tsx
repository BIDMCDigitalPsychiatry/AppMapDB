import React from 'react';
import { useProcessDataHandle } from '../../layout/LayoutStore';
import ExtendedButton from './ExtendedButton';

const ProcessDataButton = ({ pdis, ...other }) => {
  const handleProcessData = useProcessDataHandle();
  return <ExtendedButton onClick={handleProcessData(typeof pdis === 'function' ? pdis() : pdis)} {...other} />;
};

export default ProcessDataButton;
