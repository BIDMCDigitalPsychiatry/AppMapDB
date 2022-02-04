import * as React from 'react';
import RateNewAppCard, { title } from '../../application/GenericDialog/RateNewApp/RateNewAppCard';
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

  return <RateNewAppCard onClose={handleReset} />;
}

export default function RateNewApp(props) {
  const [, setState] = useDialogState(title);
  React.useEffect(() => {
    setState({
      type: 'Add',
      open: true
    });
  }, [setState]);

  return <RateExistingApp {...props} />;
}
