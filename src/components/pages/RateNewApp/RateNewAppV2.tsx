import * as React from 'react';
import RateNewAppCardV2, { title } from '../../application/GenericDialog/RateNewApp/RateNewAppCardV2';
import { useDialogState } from '../../application/GenericDialog/useDialogState';

export function RateExistingApp() {
  const [, setState] = useDialogState(title);

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

export default function RateNewAppV2(props) {
  const [, setState] = useDialogState(title);
  React.useEffect(() => {
    setState({
      type: 'Add',
      open: true
    });
  }, [setState]);

  return <RateExistingApp {...props} />;
}
