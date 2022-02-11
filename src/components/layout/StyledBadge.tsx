import createStyles from '@mui/styles/createStyles';
import { Badge } from '@mui/material';

import withStyles from '@mui/styles/withStyles';

export default withStyles(theme =>
  createStyles({
    badge: {
      height: 32,
      width: 32,
      top: 4,
      right: 14,
      border: `1px solid ${theme.palette.grey[400]}`,
      background: theme.palette.primary.light
    }
  })
)(Badge);
