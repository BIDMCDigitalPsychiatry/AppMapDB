import * as React from 'react';
import RateNewAppCard, { title } from '../application/GenericDialog/RateNewApp/RateNewAppCard';
import { useDialogState } from '../application/GenericDialog/useDialogState';

export default function RateNewApp() {
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

  return <RateNewAppCard onClose={handleReset} />;
}
