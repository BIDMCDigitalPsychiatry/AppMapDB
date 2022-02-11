import * as React from 'react';
import { Link } from '@mui/material';

const NewWindowLink = ({ url, label }) => {
  const handleLink = React.useCallback(() => {
    var win = window.open(url, '_blank');
    win.focus();
  }, [url]);

  return (
    <Link underline='always' onClick={handleLink} style={{ cursor: 'pointer' }}>
      {label}
    </Link>
  );
};

export default NewWindowLink;
