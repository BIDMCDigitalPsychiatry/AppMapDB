import * as React from 'react';
import { useChangeRoute, useTourCompleted, useTourStep } from '../../layout/hooks';
import { publicUrl } from '../../../helpers';
import pkg from '../../../../package.json';

const useTour = () => {
  const [{ redirected }, setState] = React.useState({ redirected: false });
  const { step } = useTourStep();
  const { tourCompleted } = useTourCompleted();
  const changeRoute = useChangeRoute();
  const { setStep } = useTourStep();

  const handleTour = React.useCallback(() => {
    setStep(1);
    changeRoute(publicUrl('/Home'));
  }, [setStep, changeRoute]);

  React.useEffect(() => {
    if (pkg.enableTour && !tourCompleted && step === 0) {
      handleTour(); // Automatically open the tour for first time users
    } else if (redirected === false && (!pkg.enableTour || tourCompleted)) {
      setState(p => ({ ...p, redirected: true }));
      changeRoute(publicUrl('/Apps')); // Otherwise, navigate to the app page automatically
    }
  }, [redirected, changeRoute, tourCompleted, handleTour, step]);
};

export default useTour;
