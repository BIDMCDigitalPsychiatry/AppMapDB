import * as React from 'react';
import { Link } from '@material-ui/core';

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
