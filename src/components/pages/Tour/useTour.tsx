import * as React from 'react';
import { useChangeRoute, useTourCompleted, useTourStep } from '../../layout/hooks';
import { publicUrl } from '../../../helpers';
import pkg from '../../../../package.json';

const useTour = () => {
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
    } else if (!pkg.enableTour || tourCompleted) {
      changeRoute(publicUrl('/Apps')); // Otherwise, navigate to the app page automatically
    }
  }, [tourCompleted, handleTour, step]);
};

export default useTour;
