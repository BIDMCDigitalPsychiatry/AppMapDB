import * as React from 'react';
import { Link } from '@mui/material';
import { useT } from '../../../i18n';

const NewWindowLink = ({ url, label }) => {
  const t = useT();
  const handleLink = React.useCallback(() => {
    var win = window.open(url, '_blank');
    win.focus();
  }, [url]);

  return (
    <Link underline='always' onClick={handleLink} style={{ cursor: 'pointer' }}>
      {t(label)}
    </Link>
  );
};

export default NewWindowLink;
