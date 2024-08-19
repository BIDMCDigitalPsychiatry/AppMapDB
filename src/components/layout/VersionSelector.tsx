import * as React from 'react';
import { AppState } from '../../store';
import { useSelector } from 'react-redux';
import { useLayout } from './store';
import { isEmpty } from '../../helpers';

const VersionSelector = ({ children }) => {
  const userId = useSelector((s: AppState) => s?.layout?.user?.username);
  const [, setLayout] = useLayout();

  React.useEffect(() => {
    // Auto select user when user is authenticated or logged out
    const version = isEmpty(userId) ? 'lite' : 'full';
    console.log(`Auto-selecting version...`, { version, userId });
    setLayout({ version });
  }, [userId, setLayout]);
  return children;
};

export default VersionSelector;
