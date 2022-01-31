import React from 'react';
import { isEmpty } from '../../helpers';
import LogRocket from 'logrocket';
import { useUserEmail, useUserId } from './hooks';
import pkg from '../../../package.json';

const useLogRocketUser = () => {
  const email = useUserEmail();
  const userId = useUserId();

  React.useEffect(() => {
    if (pkg.enableLogRocket && !isEmpty(userId) && !isEmpty(email)) {
      console.log(`Setting logrocket identity ${userId}:${email}`);
      LogRocket.identify(userId, {
        email
      });
    }
  }, [email, userId]);
};

export default useLogRocketUser;
