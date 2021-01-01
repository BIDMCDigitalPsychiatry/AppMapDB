import * as React from 'react';
import RateNewAppCardV2, { title } from '../../application/GenericDialog/RateNewApp/RateNewAppCardV2';
import { useDialogState } from '../../application/GenericDialog/useDialogState';

export default function RateNewAppV2() {
  const [, setState] = useDialogState(title);
  React.useEffect(() => {
    setState({
      type: 'Add',
      open: true
    });
  }, [setState]);

  const handleReset = React.useCallback(() => {
    setState({
      type: 'Add',
      open: false
    });
    setState({
      type: 'Add',
      open: true
    });
  }, [setState]);

  return <RateNewAppCardV2 onClose={handleReset} />;
}
