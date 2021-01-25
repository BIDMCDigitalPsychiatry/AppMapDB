import { createStyles } from '@material-ui/core/styles';
import { Badge, withStyles } from '@material-ui/core';

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
